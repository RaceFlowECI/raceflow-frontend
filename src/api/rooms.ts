import type { CreateRoomResponse, JoinRoomResponse } from '../types/raceflow'

const BASE = import.meta.env.VITE_API_RT

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('raceflow_token')}`,
  'Content-Type': 'application/json',
})

export const createRoom = (name: string): Promise<CreateRoomResponse> =>
  fetch(`${BASE}/rooms/create`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ name }),
  }).then(r => { if (!r.ok) throw r; return r.json() })

export const joinRoom = (roomCode: string, name: string): Promise<JoinRoomResponse> =>
  fetch(`${BASE}/rooms/join`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ roomCode, name }),
  }).then(r => { if (!r.ok) throw r; return r.json() })
