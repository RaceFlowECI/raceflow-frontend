import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, saveToken } from '../api/auth'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const auth = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name)
      saveToken(auth.token)
      nav('/salas')
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null)
        setError(body?.error ?? `Error ${err.status}`)
      } else {
        setError('No se pudo conectar con el servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #071020 0%, #0A1628 40%, #1A2B4A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 56, height: 56, background: '#17C3B2', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>RaceFlow</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>
          Entrenamiento deportivo colaborativo en tiempo real
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 390,
        background: '#fff', borderRadius: 20,
        padding: '28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 4 }}>
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta nueva'}
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
          {mode === 'login'
            ? 'Inicia sesión para entrenar con tu equipo'
            : 'Regístrate para empezar a entrenar'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>NOMBRE COMPLETO</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Juan Sebastián"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{error}</p>
          )}

          <div>
            <label style={labelStyle}>CORREO ELECTRÓNICO</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="atleta@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...labelStyle, margin: 0 }}>CONTRASEÑA</label>
              {mode === 'login' && (
                <span style={{ fontSize: 12, color: '#17C3B2', cursor: 'pointer' }}>
                  ¿Olvidaste tu contraseña?
                </span>
              )}
            </div>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPass(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 6 }} disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>o</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        </div>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{
            width: '100%', padding: '13px', background: 'transparent',
            border: '1.5px solid #E2E8F0', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: '#1E293B', cursor: 'pointer',
          }}
        >
          {mode === 'login' ? 'Crear cuenta nueva' : 'Ya tengo cuenta — Iniciar sesión'}
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 28, textAlign: 'center' }}>
        Auth Service · REST technology · #GET #authenticate
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: '#94A3B8', letterSpacing: '0.08em', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid #E2E8F0', borderRadius: 10,
  fontSize: 14, color: '#1E293B', outline: 'none',
  background: '#F8FAFC', transition: 'border-color 0.2s',
}
