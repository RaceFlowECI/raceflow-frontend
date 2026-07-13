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
    <div className="shell" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px', borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => nav('/salas')} style={{ background: 'none', fontSize: 20, padding: 4 }}>←</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0A1628', flex: 1 }}>Amigos</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 40px' }}>

        {/* Search */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 16,
          border: '1px solid #F1F5F9', marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
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
                border: '2px solid #E2E8F0', fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={doSearch}
              style={{
                padding: '11px 16px', background: '#17C3B2', color: '#fff',
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
                width: 34, height: 34, borderRadius: 50, background: '#0A1628', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{initialsOf(u.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0A1628' }}>{u.name}</p>
                <p style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
              </div>
              <button
                onClick={() => request(u.email)}
                style={{
                  padding: '7px 12px', background: '#F0FDFB', color: '#0A9088',
                  border: '2px solid #17C3B2', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}
              >+ Agregar</button>
            </div>
          ))}
          {feedback && (
            <p style={{ fontSize: 12, color: '#0A9088', fontWeight: 600, marginTop: 8 }}>{feedback}</p>
          )}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div style={{
            background: '#FFFBEB', borderRadius: 16, padding: 16,
            border: '1px solid #FDE68A', marginBottom: 16,
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>
              Solicitudes pendientes ({pending.length})
            </p>
            {pending.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0A1628' }}>{p.fromName}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>{p.fromEmail}</p>
                </div>
                <button onClick={() => answer(p.id, true)} style={{
                  padding: '7px 12px', background: '#17C3B2', color: '#fff',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>Aceptar</button>
                <button onClick={() => answer(p.id, false)} style={{
                  padding: '7px 12px', background: '#FEE2E2', color: '#B91C1C',
                  border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700,
                }}>Rechazar</button>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #F1F5F9',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
            Mis amigos ({friends.length})
          </p>
          {friends.length === 0 && (
            <p style={{ fontSize: 13, color: '#94A3B8' }}>
              Aún no tienes amigos — busca atletas arriba y envíales una solicitud.
            </p>
          )}
          {friends.map(f => (
            <div key={f.email} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: '1px solid #F8FAFC',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 50, background: '#17C3B2', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>{initialsOf(f.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0A1628' }}>{f.name}</p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{f.sport ?? f.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
