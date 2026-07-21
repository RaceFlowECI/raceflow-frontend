import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  acceptRequest, listFriends, pendingRequests, rejectRequest, searchUsers, sendFriendRequest,
} from '../api/friends'
import type { Friend, PendingRequest } from '../types/raceflow'

function initialsOf(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function Amigos() {
  const nav = useNavigate()
  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Friend[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)

  const refresh = () => {
    listFriends().then(setFriends).catch(() => setFriends([]))
    pendingRequests().then(setPending).catch(() => setPending([]))
  }

  useEffect(refresh, [])

  const doSearch = async () => {
    if (query.trim().length < 2) return
    try {
      setResults(await searchUsers(query.trim()))
    } catch {
      setResults([])
    }
  }

  const request = async (email: string) => {
    setFeedback(null)
    try {
      await sendFriendRequest(email)
      setFeedback(`Solicitud enviada a ${email}`)
      setResults(results.filter(r => r.email !== email))
    } catch (err) {
      const body = err instanceof Response ? await err.json().catch(() => null) : null
      setFeedback(body?.error ?? 'No se pudo enviar la solicitud')
    }
  }

  const answer = async (id: number, accept: boolean) => {
    try {
      if (accept) await acceptRequest(id)
      else await rejectRequest(id)
      refresh()
    } catch {
      setFeedback('No se pudo procesar la solicitud')
    }
  }

  return (
    <div className="shell" style={{ background: 'var(--ink)' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--panel)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => nav('/salas')} style={{ background: 'none', fontSize: 20, padding: 4 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--paper)', flex: 1 }}>Amigos</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }}>

        {/* Search */}
        <div style={{
          background: 'var(--panel)', borderRadius: 16, padding: 16,
          border: '1px solid var(--line)', marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--paper)', marginBottom: 10 }}>
            Buscar atletas
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
              placeholder="Nombre o correo"
              style={{
                flex: 1, minWidth: 0, padding: '11px 12px', borderRadius: 10,
                border: '2px solid var(--line)', fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={doSearch}
              style={{
                padding: '11px 16px', background: 'var(--teal)', color: 'var(--paper)',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
              }}
            >Buscar</button>
          </div>

          {results.map(u => (
            <div key={u.email} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: '1px solid #F8FAFC',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 50, background: 'var(--ink-2)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{initialsOf(u.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>{u.name}</p>
                <p style={{ fontSize: 11, color: 'var(--paper-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
              </div>
              <button
                onClick={() => request(u.email)}
                style={{
                  padding: '7px 12px', background: 'rgba(22,214,190,0.12)', color: 'var(--teal)',
                  border: '2px solid var(--teal)', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}
              >+ Agregar</button>
            </div>
          ))}
          {feedback && (
            <p style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, marginTop: 8 }}>{feedback}</p>
          )}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{
            background: 'rgba(255,91,51,0.10)', borderRadius: 16, padding: 16,
            border: '1px solid rgba(255,91,51,0.3)', marginBottom: 16,
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--coral)', marginBottom: 10 }}>
              Solicitudes pendientes ({pending.length})
            </p>
            {pending.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>{p.fromName}</p>
                  <p style={{ fontSize: 11, color: 'var(--paper-dim)' }}>{p.fromEmail}</p>
                </div>
                <button onClick={() => answer(p.id, true)} style={{
                  padding: '7px 12px', background: 'var(--teal)', color: 'var(--paper)',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>Aceptar</button>
                <button onClick={() => answer(p.id, false)} style={{
                  padding: '7px 12px', background: 'rgba(255,107,74,0.16)', color: 'var(--danger)',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>Rechazar</button>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div style={{
          background: 'var(--panel)', borderRadius: 16, padding: 16, border: '1px solid var(--line)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--paper)', marginBottom: 10 }}>
            Mis amigos ({friends.length})
          </p>
          {friends.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--paper-dim)' }}>
              Aún no tienes amigos — busca atletas arriba y envíales una solicitud.
            </p>
          )}
          {friends.map(f => (
            <div key={f.email} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: '1px solid #F8FAFC',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 50, background: 'var(--teal)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{initialsOf(f.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>{f.name}</p>
                <p style={{ fontSize: 11, color: 'var(--paper-dim)' }}>{f.sport ?? f.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
