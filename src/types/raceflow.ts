export interface AthleteRanking {
  rank: number
  email: string
  name: string
  latitude: number
  longitude: number
  distanceKm: number
  connected: boolean
}

export interface RoomStateMessage {
  type: 'ROOM_STATE'
  roomCode: string
  ranking: AthleteRanking[]
  timestamp: string
}

export interface ReactionMessage {
  type: 'REACTION'
  from: string
  emoji: string
}

export interface AuthResponse {
  token: string
  email: string
  name: string
}

export interface CreateRoomResponse {
  roomCode: string
  createdBy: string
}

export interface JoinRoomResponse {
  roomCode: string
  athleteCount: number
}
