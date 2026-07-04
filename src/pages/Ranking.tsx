import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PLAYERS = [
  { id: 'JS', name: 'Tú (Juan S.)', dist: 2.34, speed: 18.2, isMe: true  },
  { id: 'AM', name: 'Ana M.',       dist: 2.18, speed: 15.0, isMe: false },
  { id: 'KR', name: 'Karla R.',     dist: 1.99, speed: 11.3, isMe: false },
  { id: 'LP', name: 'Luis P.',      dist: 1.72, speed: 12.3, isMe: false },
]
const COLORS = ['#17C3B2', '#F59E0B', '#EF4444', '#10B981']
const REACTIONS = ['🔥', '💪', '👏', '✨']

function fmt(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export default function Ranking() {
  const nav       = useNavigate()
  const [elapsed, setElapsed] = useState(24 * 60 + 37)
  const [reaction, setReaction] = useState<string | null>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const sendReaction = (r: string) => {
    setReaction(r)
    setTimeout(() => setReaction(null), 2000)
  }

  const maxDist = PLAYERS[0].dist

  return (
    <div className="shell" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{
        background: '#0A1628', padding: '14px 16px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => nav('/sala/1/mapa')}
          style={{ background: 'none', color: '#fff', fontSize: 20, padding: 4 }}
        >←</button>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
            Ranking en tiempo real
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            Sala de patinaje · 4 atletas
          </p>
        </div>
        <div style={{
          background: '#1E3A5F', borderRadius: 8, padding: '6px 10px', textAlign: 'center',
        }}>
          <p style={{ color: '#17C3B2', fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(elapsed)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>

        {/* En vivo badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Posiciones actuales</p>
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
              Se actualizan con cada posición GPS recibida
            </p>
          </div>
          <span className="badge-live" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            EN VIVO
          </span>
        </div>

        {/* Rankings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PLAYERS.map((p, i) => (
            <div key={p.id} style={{
              background: p.isMe ? '#F0FDFB' : '#fff',
              border: p.isMe ? '2px solid #17C3B2' : '1.5px solid #F1F5F9',
              borderRadius: 14, padding: '14px 16px',
              boxShadow: p.isMe ? '0 4px 16px rgba(23,195,178,0.15)' : '0 1px 6px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Position badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 50,
                  background: i === 0 ? '#FEF3C7' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? '#D97706' : '#64748B',
                  fontWeight: 800, fontSize: 14, flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: 50, background: COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                  {p.id}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>{p.name}</span>
                    {p.isMe && (
                      <span style={{
                        background: '#0A1628', color: '#fff', fontSize: 10,
                        fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                      }}>TÚ</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 12, color: p.isMe ? '#0A9088' : '#64748B', fontWeight: 600 }}>
                      {p.dist.toFixed(2)} km
                    </span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>
                      {p.speed} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 6, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(p.dist / maxDist) * 100}%`,
                    background: COLORS[i],
                    borderRadius: 6,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reactions */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: '16px',
          border: '1px solid #F1F5F9', marginTop: 16, textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0A1628', marginBottom: 12 }}>
            Enviar reacción
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            {REACTIONS.map(r => (
              <button
                key={r}
                onClick={() => sendReaction(r)}
                style={{
                  fontSize: 28, background: reaction === r ? '#F0FDFB' : '#F8FAFC',
                  border: reaction === r ? '2px solid #17C3B2' : '2px solid #E2E8F0',
                  borderRadius: 14, width: 56, height: 56,
                  transition: 'transform 0.15s, border-color 0.15s',
                  transform: reaction === r ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
          {reaction && (
            <p style={{ fontSize: 12, color: '#17C3B2', fontWeight: 600, marginTop: 10 }}>
              Reacción {reaction} enviada al grupo
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff',
        borderTop: '1px solid #F1F5F9', padding: '12px 16px',
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button
          style={{
            flex: 1, padding: '13px', background: '#F1F5F9',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: '#475569',
          }}
          onClick={() => { if (timerRef.current) clearInterval(timerRef.current) }}
        >
          ⏸ Pausar sesión
        </button>
        <button
          style={{
            flex: 1, padding: '13px', background: '#EF4444',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: '#fff',
          }}
          onClick={() => nav('/salas')}
        >
          Finalizar sesión
        </button>
      </div>
    </div>
  )
}
