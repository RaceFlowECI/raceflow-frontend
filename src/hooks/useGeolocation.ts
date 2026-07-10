import { useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  watching: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    watching: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by this browser' }))
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          watching: true,
        })
      },
      (error) => {
        setState(s => ({ ...s, error: error.message, watching: false }))
      },
      { enableHighAccuracy: true, maximumAge: 2000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
