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

export interface VoicePresenceMessage {
  type: 'VOICE_PEER_JOINED' | 'VOICE_PEER_LEFT'
  from: string
  peers: string[]
}

export interface VoiceSignalMessage {
  type: 'VOICE_OFFER' | 'VOICE_ANSWER' | 'VOICE_ICE'
  from: string
  to: string
  sdp?: string
  candidate?: string
}

export type VoiceMessage = VoicePresenceMessage | VoiceSignalMessage

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

export interface Friend {
  email: string
  name: string
  sport?: string
}

export interface PendingRequest {
  id: number
  fromEmail: string
  fromName: string
}

export interface RoomInvitation {
  roomCode: string
  fromEmail: string
  fromName: string
  sentAt: string
}
