import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceMessage, VoiceSignalMessage } from '../types/raceflow'

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

/**
 * Voice chat over WebRTC. Audio flows peer-to-peer between browsers; the room
 * WebSocket (via sendVoiceSignal + 'raceflow:voice' events) only carries the
 * signaling: who is in the call and the offer/answer/ICE negotiation.
 *
 * Mesh topology: one RTCPeerConnection per remote peer. To avoid both sides
 * calling each other at once (glare), only the peer whose email sorts LOWER
 * initiates the offer for each pair.
 */
export function useVoiceChat(
  myEmail: string,
  sendVoiceSignal: (payload: Record<string, unknown>) => void,
) {
  const [inCall, setInCall] = useState(false)
  const [muted, setMuted] = useState(false)
  const [voicePeers, setVoicePeers] = useState<string[]>([])
  const [micError, setMicError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const inCallRef = useRef(false)

  const closePeer = useCallback((email: string) => {
    peersRef.current.get(email)?.close()
    peersRef.current.delete(email)
    const audio = audiosRef.current.get(email)
    if (audio) {
      audio.srcObject = null
      audio.remove()
      audiosRef.current.delete(email)
    }
  }, [])

  const createPeer = useCallback(
    (remoteEmail: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS)
      peersRef.current.set(remoteEmail, pc)

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current as MediaStream)
      })

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendVoiceSignal({
            type: 'VOICE_ICE',
            to: remoteEmail,
            candidate: JSON.stringify(e.candidate),
          })
        }
      }

      pc.ontrack = (e) => {
        let audio = audiosRef.current.get(remoteEmail)
        if (!audio) {
          audio = new Audio()
          audio.autoplay = true
          audiosRef.current.set(remoteEmail, audio)
        }
        audio.srcObject = e.streams[0]
      }

      return pc
    },
    [sendVoiceSignal],
  )

  const callPeer = useCallback(
    async (remoteEmail: string) => {
      const pc = createPeer(remoteEmail)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendVoiceSignal({ type: 'VOICE_OFFER', to: remoteEmail, sdp: JSON.stringify(offer) })
    },
    [createPeer, sendVoiceSignal],
  )

  useEffect(() => {
    const handler = async (e: Event) => {
      const msg = (e as CustomEvent<VoiceMessage>).detail

      if (msg.type === 'VOICE_PEER_JOINED' || msg.type === 'VOICE_PEER_LEFT') {
        setVoicePeers(msg.peers)
        if (!inCallRef.current) return
        if (msg.type === 'VOICE_PEER_JOINED') {
          // Glare avoidance: for each pair, only the lexicographically lower
          // email initiates the offer — the other side just answers.
          if (msg.from === myEmail) {
            for (const peer of msg.peers) {
              if (peer !== myEmail && myEmail < peer) await callPeer(peer)
            }
          } else if (myEmail < msg.from) {
            await callPeer(msg.from)
          }
        }
        if (msg.type === 'VOICE_PEER_LEFT') closePeer(msg.from)
        return
      }

      if (!inCallRef.current) return
      const signal = msg as VoiceSignalMessage

      if (signal.type === 'VOICE_OFFER') {
        const pc = peersRef.current.get(signal.from) ?? createPeer(signal.from)
        await pc.setRemoteDescription(JSON.parse(signal.sdp as string))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendVoiceSignal({ type: 'VOICE_ANSWER', to: signal.from, sdp: JSON.stringify(answer) })
      } else if (signal.type === 'VOICE_ANSWER') {
        await peersRef.current
          .get(signal.from)
          ?.setRemoteDescription(JSON.parse(signal.sdp as string))
      } else if (signal.type === 'VOICE_ICE') {
        await peersRef.current
          .get(signal.from)
          ?.addIceCandidate(JSON.parse(signal.candidate as string))
      }
    }

    window.addEventListener('raceflow:voice', handler)
    return () => window.removeEventListener('raceflow:voice', handler)
  }, [myEmail, callPeer, closePeer, createPeer, sendVoiceSignal])

  const joinCall = useCallback(async () => {
    setMicError(null)
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setMicError('No se pudo acceder al micrófono. Revisa los permisos del navegador.')
      return
    }
    inCallRef.current = true
    setInCall(true)
    setMuted(false)
    sendVoiceSignal({ type: 'VOICE_JOIN' })
  }, [sendVoiceSignal])

  const leaveCall = useCallback(() => {
    sendVoiceSignal({ type: 'VOICE_LEAVE' })
    inCallRef.current = false
    setInCall(false)
    peersRef.current.forEach((_, email) => closePeer(email))
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
  }, [closePeer, sendVoiceSignal])

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    const enabled = !stream.getAudioTracks()[0]?.enabled
    stream.getAudioTracks().forEach((t) => {
      t.enabled = enabled
    })
    setMuted(!enabled)
  }, [])

  useEffect(() => {
    return () => {
      if (inCallRef.current) leaveCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { inCall, muted, voicePeers, micError, joinCall, leaveCall, toggleMute }
}
