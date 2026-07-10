import { useEffect, useRef, useState, useCallback } from 'react'
import type { AthleteRanking, ReactionMessage, RoomStateMessage } from '../types/raceflow'

const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 3000

export function useWebSocket(roomCode: string, token: string) {
  const [ranking, setRanking] = useState<AthleteRanking[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const attemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closedByClientRef = useRef(false)

  useEffect(() => {
    // Allowlist validation: room codes are exactly 6 alphanumeric chars and
    // tokens are JWTs (base64url segments); anything else never reaches the URL.
    if (!/^[A-Za-z0-9]{6}$/.test(roomCode) || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return

    closedByClientRef.current = false

    const connect = () => {
      const base = import.meta.env.VITE_WS_URL
      const ws = new WebSocket(
        `${base}/ws/room/${encodeURIComponent(roomCode)}?token=${encodeURIComponent(token)}`,
      )
      wsRef.current = ws

      ws.onopen = () => {
        attemptsRef.current = 0
        setConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RoomStateMessage | ReactionMessage
          if (data.type === 'ROOM_STATE') {
            setRanking(data.ranking)
          } else if (data.type === 'REACTION') {
            window.dispatchEvent(new CustomEvent('raceflow:reaction', { detail: data }))
          }
        } catch (err) {
          console.error('Failed to parse WS message', err)
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (closedByClientRef.current) return
        if (attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          attemptsRef.current += 1
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error', err)
      }
    }

    connect()

    return () => {
      closedByClientRef.current = true
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [roomCode, token])

  const sendPosition = useCallback((lat: number, lng: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'POSITION', latitude: lat, longitude: lng }))
    }
  }, [])

  const sendReaction = useCallback((emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'REACTION', emoji }))
    }
  }, [])

  return { ranking, sendPosition, sendReaction, connected }
}
