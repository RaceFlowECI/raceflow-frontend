import type { Friend, PendingRequest, RoomInvitation } from '../types/raceflow'

const AUTH = import.meta.env.VITE_API_AUTH
const RT = import.meta.env.VITE_API_RT

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('raceflow_token')}`,
  'Content-Type': 'application/json',
})

// Allowlist validation before any value reaches a request URL (sonar S8476)
const safeQuery = (q: string): string => {
  const trimmed = q.trim().slice(0, 60)
  if (!/^[\w.@\-+ áéíóúÁÉÍÓÚñÑ]*$/.test(trimmed)) throw new Error('Búsqueda inválida')
  return encodeURIComponent(trimmed)
}

const safeRoomCode = (code: string): string => {
  if (!/^[A-Za-z0-9]{6}$/.test(code)) throw new Error('Código de sala inválido')
  return code
}

const safeId = (id: number): number => {
  if (!Number.isInteger(id) || id < 0) throw new Error('Id inválido')
  return id
}

export const listFriends = (): Promise<Friend[]> =>
  fetch(`${AUTH}/friends`, { headers: authHeader() })
    .then(r => { if (!r.ok) throw r; return r.json() })

export const searchUsers = (q: string): Promise<Friend[]> =>
  fetch(`${AUTH}/friends/search?q=${safeQuery(q)}`, { headers: authHeader() })
    .then(r => { if (!r.ok) throw r; return r.json() })

export const pendingRequests = (): Promise<PendingRequest[]> =>
  fetch(`${AUTH}/friends/requests`, { headers: authHeader() })
    .then(r => { if (!r.ok) throw r; return r.json() })

export const sendFriendRequest = (email: string): Promise<void> =>
  fetch(`${AUTH}/friends/requests`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email }),
  }).then(r => { if (!r.ok) throw r })

export const acceptRequest = (id: number): Promise<void> =>
  fetch(`${AUTH}/friends/requests/${safeId(id)}/accept`, { method: 'POST', headers: authHeader() })
    .then(r => { if (!r.ok) throw r })

export const rejectRequest = (id: number): Promise<void> =>
  fetch(`${AUTH}/friends/requests/${safeId(id)}`, { method: 'DELETE', headers: authHeader() })
    .then(r => { if (!r.ok) throw r })

export const inviteToRoom = (roomCode: string, email: string): Promise<void> =>
  fetch(`${RT}/rooms/${safeRoomCode(roomCode)}/invite`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ email }),
  }).then(r => { if (!r.ok) throw r })

export const myInvitations = (): Promise<RoomInvitation[]> =>
  fetch(`${RT}/invitations`, { headers: authHeader() })
    .then(r => { if (!r.ok) throw r; return r.json() })

export const declineInvitation = (roomCode: string): Promise<void> =>
  fetch(`${RT}/invitations/${safeRoomCode(roomCode)}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(r => { if (!r.ok) throw r })
