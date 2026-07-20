import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeToken, getToken } from '../api/auth'
import { createRoom, joinRoom } from '../api/rooms'
import { declineInvitation, myInvitations } from '../api/friends'
import type { RoomInvitation } from '../types/raceflow'

export default function Salas() {
  const nav   = useNavigate()
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [invitations, setInvitations] = useState<RoomInvitation[]>([])
  const refs  = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const load = () => myInvitations().then(setInvitations).catch(() => setInvitations([]))
    load()
    const timer = setInterval(load, 8000)
    return () => clearInterval(timer)
  }, [])

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

  const acceptInvitation = async (inv: RoomInvitation) => {
    setBusy(true)
    try {
      await joinRoom(inv.roomCode, userName)
      nav(`/sala/${inv.roomCode}/mapa`)
    } catch {
      setError('La sala de la invitación ya no está disponible')
      declineInvitation(inv.roomCode).catch(() => {})
      setInvitations(invitations.filter(i => i.roomCode !== inv.roomCode))
    } finally {
      setBusy(false)
    }
  }

  const dismissInvitation = (inv: RoomInvitation) => {
    declineInvitation(inv.roomCode).catch(() => {})
    setInvitations(invitations.filter(i => i.roomCode !== inv.roomCode))
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
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--panel)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--paper)', flex: 1 }}>Salas</h1>
        <button
          type="button"
          onClick={() => nav('/amigos')}
          style={{
            padding: '9px 14px', background: 'rgba(22,214,190,0.12)', color: 'var(--teal)',
            border: '2px solid var(--teal)', borderRadius: 10, fontSize: 13, fontWeight: 700,
            marginRight: 10,
          }}
        >👥 Amigos</button>
        <div style={{
          width: 38, height: 38, background: 'var(--teal)', borderRadius: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--paper)', fontWeight: 700, fontSize: 14,
        }}>{userInitials}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>

        {/* Invitations */}
        {invitations.length > 0 && (
          <div style={{
            background: 'rgba(22,214,190,0.12)', borderRadius: 16, padding: 16,
            border: '2px solid var(--teal)', marginBottom: 16,
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>
              📩 Invitaciones ({invitations.length})
            </p>
            {invitations.map(inv => (
              <div key={inv.roomCode} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>
                    {inv.fromName} te invitó a su sala
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--paper-dim)' }}>Sala {inv.roomCode}</p>
                </div>
                <button type="button" onClick={() => acceptInvitation(inv)} disabled={busy} style={{
                  padding: '8px 14px', background: 'var(--teal)', color: 'var(--paper)',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>Unirse</button>
                <button type="button" onClick={() => dismissInvitation(inv)} style={{
                  padding: '8px 12px', background: 'var(--panel-2)', color: 'var(--paper-dim)',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Join by code */}
        <div style={{
          background: 'var(--panel)', borderRadius: 16, padding: '20px',
          border: '1px solid var(--line)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--paper)', marginBottom: 4 }}>
            ¿Tienes un código?
          </h2>
          <p style={{ fontSize: 12, color: 'var(--paper-dim)', marginBottom: 16 }}>
            Opción manual — la forma principal de entrar es por invitación de un amigo
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
                  // minWidth: 0 lets the inputs shrink below their intrinsic
                  // width so the 6 boxes fit on narrow (mobile) screens
                  flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box',
                  height: 48, textAlign: 'center',
                  border: c ? '2px solid var(--teal)' : '2px solid var(--line)',
                  borderRadius: 10, fontSize: 18, fontWeight: 700,
                  color: 'var(--paper)', background: c ? 'rgba(22,214,190,0.12)' : 'var(--panel-2)',
                  outline: 'none', transition: 'border-color 0.15s',
                  textTransform: 'uppercase',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-primary"
            disabled={joinCode.length < 6 || busy}
            onClick={handleJoin}
            style={{ opacity: joinCode.length < 6 ? 0.5 : 1 }}
          >
            Unirse a la sala
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 12, color: 'var(--paper-dim)' }}>o crear una nueva sala</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <button type="button" data-testid="create-room" className="btn-dark" onClick={handleCreate} disabled={busy}>
            + Crear sala de entrenamiento
          </button>

          {error && (
            <p data-testid="rooms-error" style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 10 }}>{error}</p>
          )}
        </div>

      </div>

      <div style={{
        padding: '10px 20px', borderTop: '1px solid var(--line)',
        background: 'var(--panel)', position: 'sticky', bottom: 0,
      }}>
        <p style={{ fontSize: 11, color: 'var(--paper-dim)', textAlign: 'center' }}>
          Room Service · REST · #GET #createRoom #joinRoom
        </p>
      </div>
    </div>
  )
}
