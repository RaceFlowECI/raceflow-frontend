import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getToken, decodeToken } from '../api/auth'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGeolocation } from '../hooks/useGeolocation'

// Fallback center used only until the browser's geolocation service resolves
// a real fix (or if the user denies permission). Never used once real coords arrive.
const FALLBACK_CENTER: [number, number] = [4.6097, -74.0817] // Bogotá city center
const FALLBACK_ZOOM = 12
const LOCATED_ZOOM = 16
const SELF_COLOR = '#16D6BE'
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] // oro, plata, bronce
const DEFAULT_COLOR = '#3B82F6'

function initialsOf(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function colorFor(rank: number, isSelf: boolean) {
  if (isSelf) return SELF_COLOR
  if (rank >= 1 && rank <= 3) return RANK_COLORS[rank - 1]
  return DEFAULT_COLOR
}

function makeIcon(initials: string, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;background:${color};
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:11px;font-family:Inter,sans-serif;
    ">${initials}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

// Trail cap per athlete: at one point per ROOM_STATE broadcast this covers a
// long session while bounding memory; older points are dropped from the tail.
const MAX_TRAIL_POINTS = 600

export default function Mapa() {
  const nav     = useNavigate()
  const { id: roomCode } = useParams<{ id: string }>()
  const mapRef  = useRef<HTMLDivElement>(null)
  const leafRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const trailsRef = useRef<Map<string, { points: [number, number][]; line: L.Polyline }>>(new Map())

  const token = getToken() ?? ''
  const claims = token ? decodeToken(token) : null
  const selfEmail = (claims?.sub as string) ?? ''

  const { ranking, sendPosition, connected } = useWebSocket(roomCode ?? '', token)
  const { latitude, longitude, error: geoError } = useGeolocation()
  const hasCenteredRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || leafRef.current) return

    const map = L.map(mapRef.current, {
      center:  FALLBACK_CENTER,
      zoom:    FALLBACK_ZOOM,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    leafRef.current = map
    return () => {
      map.remove()
      leafRef.current = null
      // map.remove() already detaches the layers; drop our stale references
      // so a remount starts markers/trails from scratch.
      markersRef.current.clear()
      trailsRef.current.clear()
    }
  }, [])

  // Once the browser's geolocation service resolves a real fix, center the map on it
  // (only the first time - subsequent updates shouldn't yank the view around) and
  // stream it to the room over the socket.
  useEffect(() => {
    if (latitude == null || longitude == null) return

    if (!hasCenteredRef.current && leafRef.current) {
      leafRef.current.setView([latitude, longitude], LOCATED_ZOOM);
      hasCenteredRef.current = true
    }

    sendPosition(latitude, longitude)
  }, [latitude, longitude, sendPosition])

  // Sync markers and per-athlete trails with live ranking data. The backend
  // only keeps each athlete's LAST position (rooms are in-memory and
  // ephemeral), so the trajectory is accumulated client-side from the
  // ROOM_STATE broadcasts received while this screen is open.
  useEffect(() => {
    const map = leafRef.current
    if (!map) return

    const seen = new Set<string>()

    ranking.forEach(a => {
      if (a.latitude === 0 && a.longitude === 0) return
      seen.add(a.email)
      const isSelf = a.email === selfEmail
      const color = colorFor(a.rank, isSelf)
      const icon = makeIcon(initialsOf(a.name), color)
      const existing = markersRef.current.get(a.email)

      if (existing) {
        existing.setLatLng([a.latitude, a.longitude])
        existing.setIcon(icon)
        existing.setTooltipContent(isSelf ? `Tú (${a.name})` : a.name)
      } else {
        const marker = L.marker([a.latitude, a.longitude], { icon })
          .addTo(map)
          .bindTooltip(isSelf ? `Tú (${a.name})` : a.name, { permanent: false, direction: 'top', offset: [0, -20] })
        markersRef.current.set(a.email, marker)
      }

      // --- Trail ---
      let trail = trailsRef.current.get(a.email)
      if (!trail) {
        trail = {
          points: [],
          line: L.polyline([], { color, weight: 4, opacity: 0.65, lineCap: 'round', lineJoin: 'round' }).addTo(map),
        }
        trailsRef.current.set(a.email, trail)
      }

      // Every broadcast repeats each athlete's current position even if only
      // someone else moved, so only append when this athlete actually moved.
      const last = trail.points[trail.points.length - 1]
      if (!last || last[0] !== a.latitude || last[1] !== a.longitude) {
        trail.points.push([a.latitude, a.longitude])
        if (trail.points.length > MAX_TRAIL_POINTS) trail.points.shift()
        trail.line.setLatLngs(trail.points)
      }
      // Keep the trail color in sync with the marker (rank changes recolor both)
      trail.line.setStyle({ color })
    })

    markersRef.current.forEach((marker, email) => {
      if (!seen.has(email)) {
        marker.remove()
        markersRef.current.delete(email)
      }
    })
    trailsRef.current.forEach((trail, email) => {
      if (!seen.has(email)) {
        trail.line.remove()
        trailsRef.current.delete(email)
      }
    })
  }, [ranking, selfEmail])

  return (
    <div className="shell" style={{ background: 'var(--panel)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'var(--ink-2)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => nav('/salas')}
          style={{ background: 'none', color: 'var(--paper)', fontSize: 20, padding: 4 }}
        >←</button>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 15 }}>
            Sala {roomCode}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{ranking.length} atletas</span>
            {connected && <span className="badge-live">En vivo</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => nav(`/sala/${roomCode}/ranking`)}
          style={{
            background: 'var(--teal)', color: 'var(--paper)', borderRadius: 8,
            padding: '6px 12px', fontSize: 12, fontWeight: 600,
          }}
        >Ranking</button>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', flex: 1 }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        {geoError && (
          <div style={{
            position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000,
            background: 'rgba(255,107,74,0.12)', border: '1px solid rgba(255,107,74,0.35)', borderRadius: 10,
            padding: '8px 12px', fontSize: 12, color: 'var(--danger)',
          }}>
            No se pudo obtener tu ubicación ({geoError}). Habilita el permiso de GPS para transmitir tu posición.
          </div>
        )}
      </div>

      {/* Mini ranking panel */}
      <div style={{
        background: 'var(--panel)', borderTop: '1px solid var(--line)',
        padding: '12px 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--paper)' }}>Ranking en vivo</span>
          <span
            onClick={() => nav(`/sala/${roomCode}/ranking`)}
            style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}
          >Ver completo →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ranking.map(a => {
            const isSelf = a.email === selfEmail
            return (
              <div key={a.email} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--paper-dim)', width: 16, textAlign: 'center' }}>
                  {a.rank}
                </span>
                <div style={{
                  width: 26, height: 26, borderRadius: 50, background: colorFor(a.rank, isSelf),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--paper)', fontSize: 9, fontWeight: 700,
                }}>{initialsOf(a.name)}</div>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--paper)', fontWeight: a.rank === 1 ? 700 : 400 }}>
                  {isSelf ? `Tú (${a.name})` : a.name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: a.rank === 1 ? 'var(--teal)' : 'var(--paper-dim)' }}>
                  {a.distanceKm.toFixed(2)} km
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '8px', background: 'var(--panel)', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--paper-dim)', textAlign: 'center' }}>
          Vite/React + Leaflet.js + WebSocket · RaceFlow Realtime Service
        </p>
      </div>
    </div>
  )
}
