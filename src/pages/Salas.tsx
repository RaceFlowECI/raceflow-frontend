import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeToken, getToken } from '../api/auth'
import { createRoom, joinRoom } from '../api/rooms'

const ROOMS = [
  { id: '1', name: 'Sala de patinaje - Bogotá', sport: 'Patinaje', athletes: 4 },
  { id: '2', name: 'Running matutino - Parque', sport: 'Running',   athletes: 2 },
  { id: '3', name: 'Entrenamiento grupal #3',   sport: 'Ciclismo',  athletes: 7 },
]

const SPORT_ICON: Record<string, string> = {
  Patinaje: '⛸️', Running: '🏃', Ciclismo: '🚴',
}

export default function Salas() {
  const nav   = useNavigate()
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const refs  = useRef<(HTMLInputElement | null)[]>([])

  const token = getToken()
  const claims = token ? decodeToken(token) : null
  const userName = (claims?.name as string) ?? (claims?.sub as string) ?? 'Atleta'
  const userInitials = userName
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleCreate = async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await createRoom(userName)
      nav(`/sala/${res.roomCode}/mapa`)
    } catch {
      setError('No se pudo crear la sala')
    } finally {
      setBusy(false)
    }
  }

  const handleJoin = async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await joinRoom(joinCode, userName)
      nav(`/sala/${res.roomCode}/mapa`)
    } catch {
      setError('Código de sala inválido')
    } finally {
      setBusy(false)
    }
  }

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handleChange = (i: number, val: string) => {
    const v = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const next = [...code]
    next[i] = v
    setCode(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase().slice(0, 6)
    const next  = Array(6).fill('')
    text.split('').forEach((c, i) => { next[i] = c })
    setCode(next)
    refs.current[Math.min(text.length, 5)]?.focus()
    e.preventDefault()
  }

  const joinCode = code.join('')

  return (
    <div className="shell">
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0A1628' }}>Salas</h1>
        <div style={{
          width: 38, height: 38, background: '#17C3B2', borderRadius: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>{userInitials}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>

        {/* Join by code */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px',
          border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A1628', marginBottom: 4 }}>
            Unirse con código
          </h2>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
            Ingresa el código de 6 caracteres
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }} onPaste={handlePaste}>
            {code.map((c, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                value={c}
                maxLength={1}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                style={{
                  flex: 1, height: 48, textAlign: 'center',
                  border: c ? '2px solid #17C3B2' : '2px solid #E2E8F0',
                  borderRadius: 10, fontSize: 18, fontWeight: 700,
                  color: '#0A1628', background: c ? '#F0FDFB' : '#F8FAFC',
                  outline: 'none', transition: 'border-color 0.15s',
                  textTransform: 'uppercase',
                }}
              />
            ))}
          </div>

          <button
            className="btn-primary"
            disabled={joinCode.length < 6 || busy}
            onClick={handleJoin}
            style={{ opacity: joinCode.length < 6 ? 0.5 : 1 }}
          >
            Unirse a la sala
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>o crear una nueva sala</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          <button className="btn-dark" onClick={handleCreate} disabled={busy}>
            + Crear sala de entrenamiento
          </button>

          {error && (
            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, marginTop: 10 }}>{error}</p>
          )}
        </div>

        {/* Active rooms */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628' }}>Salas activas ahora</h3>
            <span style={{ fontSize: 12, color: '#17C3B2', fontWeight: 600 }}>
              {ROOMS.length} salas en curso
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROOMS.map(room => (
              <div
                key={room.id}
                onClick={() => nav(`/sala/${room.id}/mapa`)}
                style={{
                  background: '#fff', borderRadius: 14, padding: '14px 16px',
                  border: '1px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{
                  width: 42, height: 42, background: '#F0FDFB', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {SPORT_ICON[room.sport]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0A1628', marginBottom: 2 }}>
                    {room.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748B' }}>
                    {room.sport} · {room.athletes} atletas
                  </p>
                </div>
                <span className="badge-live">En vivo</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        padding: '10px 20px', borderTop: '1px solid #F1F5F9',
        background: '#fff', position: 'sticky', bottom: 0,
      }}>
        <p style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center' }}>
          Room Service · REST · #GET #createRoom #joinRoom
        </p>
      </div>
    </div>
  )
}
