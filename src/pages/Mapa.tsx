import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Mock athlete positions around Parque Simón Bolívar, Bogotá
const ATHLETES = [
  { id: 'JS', label: 'Tú (JS)', lat: 4.6589, lng: -74.0963, color: '#17C3B2', dist: '2.34 km' },
  { id: 'AM', label: 'Ana M.',  lat: 4.6600, lng: -74.0948, color: '#F59E0B', dist: '2.18 km' },
  { id: 'KR', label: 'Karla R.',lat: 4.6575, lng: -74.0975, color: '#EF4444', dist: '1.95 km' },
  { id: 'LP', label: 'Luis P.', lat: 4.6612, lng: -74.0930, color: '#10B981', dist: '1.72 km' },
]

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

export default function Mapa() {
  const nav     = useNavigate()
  const mapRef  = useRef<HTMLDivElement>(null)
  const leafRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || leafRef.current) return

    const map = L.map(mapRef.current, {
      center:  [4.6589, -74.0963],
      zoom:    16,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    ATHLETES.forEach(a => {
      L.marker([a.lat, a.lng], { icon: makeIcon(a.id, a.color) })
        .addTo(map)
        .bindTooltip(a.label, { permanent: false, direction: 'top', offset: [0, -20] })
    })

    leafRef.current = map
    return () => { map.remove(); leafRef.current = null }
  }, [])

  return (
    <div className="shell" style={{ background: '#fff' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: '#0A1628',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <button
          onClick={() => nav('/salas')}
          style={{ background: 'none', color: '#fff', fontSize: 20, padding: 4 }}
        >←</button>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            Sala de patinaje - Bogotá
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>4 atletas</span>
            <span className="badge-live">En vivo</span>
          </div>
        </div>
        <button
          onClick={() => nav('/sala/1/ranking')}
          style={{
            background: '#17C3B2', color: '#fff', borderRadius: 8,
            padding: '6px 12px', fontSize: 12, fontWeight: 600,
          }}
        >Ranking</button>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1 }} />

      {/* Mini ranking panel */}
      <div style={{
        background: '#fff', borderTop: '1px solid #F1F5F9',
        padding: '12px 16px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>Ranking en vivo</span>
          <span
            onClick={() => nav('/sala/1/ranking')}
            style={{ fontSize: 12, color: '#17C3B2', fontWeight: 600, cursor: 'pointer' }}
          >Ver completo →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ATHLETES.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#94A3B8', width: 16, textAlign: 'center' }}>
                {i + 1}
              </span>
              <div style={{
                width: 26, height: 26, borderRadius: 50, background: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }}>{a.id}</div>
              <span style={{ flex: 1, fontSize: 13, color: '#1E293B', fontWeight: i === 0 ? 700 : 400 }}>
                {a.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? '#17C3B2' : '#64748B' }}>
                {a.dist}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px', background: '#fff', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center' }}>
          Vite/React + Leaflet.js + WebSocket · RaceFlow Realtime Service
        </p>
      </div>
    </div>
  )
}
