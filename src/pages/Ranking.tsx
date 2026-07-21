import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken, decodeToken } from '../api/auth'
import { inviteToRoom, listFriends } from '../api/friends'
import { useWebSocket } from '../hooks/useWebSocket'
import { useVoiceChat } from '../hooks/useVoiceChat'
import type { Friend } from '../types/raceflow'

const COLORS = ['#16D6BE', '#F59E0B', '#EF4444', '#10B981']

function fmt(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function initialsOf(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function Ranking() {
  const nav       = useNavigate()
  const { id: roomCode } = useParams<{ id: string }>()
  const [elapsed, setElapsed] = useState(0)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const token = getToken() ?? ''
  const claims = token ? decodeToken(token) : null
  const selfEmail = (claims?.sub as string) ?? ''

  const { ranking, sendVoiceSignal } = useWebSocket(roomCode ?? '', token)
  const { inCall, muted, voicePeers, micError, joinCall, leaveCall, toggleMute } =
    useVoiceChat(selfEmail, sendVoiceSignal)

  const [showInvite, setShowInvite] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [invited, setInvited] = useState<string[]>([])

  const openInvite = async () => {
    setShowInvite(!showInvite)
    if (!showInvite) {
      try { setFriends(await listFriends()) } catch { setFriends([]) }
    }
  }

  const invite = async (email: string) => {
    try {
      await inviteToRoom(roomCode ?? '', email)
      setInvited([...invited, email])
    } catch { /* la invitación fallida simplemente no marca el check */ }
  }

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const maxDist = ranking.length > 0 ? Math.max(...ranking.map(p => p.distanceKm), 0.001) : 1

  return (
    <div className="shell" style={{ background: 'var(--ink)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink-2)', padding: '14px 16px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => nav(`/sala/${roomCode}/mapa`)}
          style={{ background: 'none', color: 'var(--paper)', fontSize: 20, padding: 4 }}
        >←</button>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--paper)', fontWeight: 700, fontSize: 15 }}>
            Ranking en tiempo real
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            Sala {roomCode} · {ranking.length} atletas
          </p>
        </div>
        <div style={{
          background: 'var(--panel-2)', borderRadius: 8, padding: '6px 10px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--teal)', fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(elapsed)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>

        {/* En vivo badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--paper)' }}>Posiciones actuales</p>
            <p style={{ fontSize: 11, color: 'var(--paper-dim)', marginTop: 2 }}>
              Se actualizan con cada posición GPS recibida
            </p>
          </div>
          <span className="badge-live" style={{ background: 'rgba(22,214,190,0.16)', color: 'var(--teal)' }}>
            EN VIVO
          </span>
        </div>

        {/* Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranking.map((p, i) => {
            const isMe = p.email === selfEmail
            return (
              <div key={p.email} style={{
                background: isMe ? 'rgba(22,214,190,0.12)' : 'var(--panel)',
                border: isMe ? '2px solid var(--teal)' : '1.5px solid var(--line)',
                borderRadius: 14, padding: '14px 16px',
                boxShadow: isMe ? '0 4px 16px rgba(23,195,178,0.15)' : '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Position badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 50,
                    background: p.rank === 1 ? 'rgba(255,91,51,0.14)' : 'var(--panel-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: p.rank === 1 ? 'var(--coral)' : 'var(--paper-dim)',
                    fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {p.rank}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 50, background: COLORS[i % COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--paper)', fontWeight: 700, fontSize: 12, flexShrink: 0,
                  }}>
                    {initialsOf(p.name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--paper)' }}>{p.name}</span>
                      {isMe && (
                        <span style={{
                          background: 'var(--ink-2)', color: 'var(--paper)', fontSize: 10,
                          fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                        }}>TÚ</span>
                      )}
                      {!p.connected && (
                        <span style={{ fontSize: 10, color: 'var(--paper-dim)' }}>desconectado</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 12, color: isMe ? 'var(--teal)' : 'var(--paper-dim)', fontWeight: 600 }}>
                        {p.distanceKm.toFixed(2)} km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 6, background: 'var(--panel-2)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(p.distanceKm / maxDist) * 100}%`,
                      background: COLORS[i % COLORS.length],
                      borderRadius: 6,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Voice chat */}
        <div style={{
          background: 'var(--panel)', borderRadius: 14, padding: '16px',
          border: '1px solid var(--line)', marginTop: 16, textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)', marginBottom: 4 }}>
            Chat de voz del grupo
          </p>
          <p style={{ fontSize: 11, color: 'var(--paper-dim)', marginBottom: 12 }}>
            {voicePeers.length === 0
              ? 'Nadie está en la llamada todavía'
              : `${voicePeers.length} en la llamada: ${ranking
                  .filter(p => voicePeers.includes(p.email))
                  .map(p => (p.email === selfEmail ? 'Tú' : p.name))
                  .join(', ') || voicePeers.length}`}
          </p>

          {!inCall ? (
            <button
              onClick={joinCall}
              style={{
                padding: '13px 26px', background: 'var(--teal)', border: 'none',
                borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'var(--paper)',
              }}
            >
              🎙 Unirse a la llamada
            </button>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                onClick={toggleMute}
                style={{
                  padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                  background: muted ? 'rgba(255,91,51,0.14)' : 'var(--panel-2)',
                  border: muted ? '2px solid #D97706' : '2px solid var(--line)',
                  color: muted ? 'var(--coral)' : 'var(--paper-dim)',
                }}
              >
                {muted ? '🔇 Micrófono apagado' : '🎙 Silenciar'}
              </button>
              <button
                onClick={leaveCall}
                style={{
                  padding: '13px 22px', background: 'var(--danger)', border: 'none',
                  borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'var(--paper)',
                }}
              >
                📵 Colgar
              </button>
            </div>
          )}

          {micError && (
            <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 10 }}>
              {micError}
            </p>
          )}
          {inCall && (
            <p style={{ fontSize: 11, color: 'var(--paper-dim)', marginTop: 10 }}>
              Audio P2P vía WebRTC — el servidor solo coordina la conexión
            </p>
          )}
        </div>

        {/* Invite friends */}
        <div style={{
          background: 'var(--panel)', borderRadius: 14, padding: '16px',
          border: '1px solid var(--line)', marginTop: 16,
        }}>
          <button
            onClick={openInvite}
            style={{
              width: '100%', padding: '12px', background: 'rgba(22,214,190,0.12)', color: 'var(--teal)',
              border: '2px solid var(--teal)', borderRadius: 12, fontSize: 14, fontWeight: 700,
            }}
          >
            👥 Invitar amigos a esta sala {showInvite ? '▲' : '▼'}
          </button>

          {showInvite && (
            <div style={{ marginTop: 12 }}>
              {friends.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--paper-dim)', textAlign: 'center' }}>
                  No tienes amigos aún — agrégalos desde Salas → Amigos
                </p>
              )}
              {friends.map(f => (
                <div key={f.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>{f.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--paper-dim)' }}>{f.email}</p>
                  </div>
                  {invited.includes(f.email) ? (
                    <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 700 }}>✓ Invitado</span>
                  ) : (
                    <button onClick={() => invite(f.email)} style={{
                      padding: '7px 12px', background: 'var(--teal)', color: 'var(--paper)',
                      border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                    }}>Invitar</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'sticky', bottom: 0, background: 'var(--panel)',
        borderTop: '1px solid var(--line)', padding: '12px 16px',
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button
          style={{
            flex: 1, padding: '13px', background: 'var(--panel-2)',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: 'var(--paper-dim)',
          }}
          onClick={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        >
          ⏸ Pausar sesión
        </button>
        <button
          style={{
            flex: 1, padding: '13px', background: 'var(--danger)',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: 'var(--paper)',
          }}
          onClick={() => nav('/salas')}
        >
          Finalizar sesión
        </button>
      </div>
    </div>
  )
}
