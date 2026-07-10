import type { AuthResponse } from '../types/raceflow'

const BASE = import.meta.env.VITE_API_AUTH

export const register = (email: string, password: string, name: string, sport?: string): Promise<AuthResponse> =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, sport }),
  }).then(r => { if (!r.ok) throw r; return r.json() })

export const login = (email: string, password: string): Promise<AuthResponse> =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(r => { if (!r.ok) throw r; return r.json() })

export const getToken = (): string | null => localStorage.getItem('raceflow_token')

export const saveToken = (t: string): void => {
  localStorage.setItem('raceflow_token', t)
}

export const clearToken = (): void => {
  localStorage.removeItem('raceflow_token')
}

export function decodeToken(token: string): { sub?: string; [key: string]: unknown } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}
