import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, saveToken } from '../api/auth'
import './Login.css'

// Hand-drawn "recorded route" behind the glass (viewBox 0 0 400 400).
const ROUTE = 'M30,320 C70,270 60,210 120,190 S200,220 220,160 S270,90 320,120 S380,190 350,250'

// Mirrors the backend's @Pattern on RegisterRequest.password (auth-service):
// 8+ chars, at least one lowercase, one uppercase, one digit, one special char.
const PASSWORD_POLICY_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
// Mirrors the backend's @Email regexp: requires a real domain suffix.
const EMAIL_FORMAT_RE = /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/

function passwordMatchesEmail(password: string, email: string): boolean {
  const p = password.trim().toLowerCase()
  const e = email.trim().toLowerCase()
  const local = e.includes('@') ? e.slice(0, e.indexOf('@')) : e
  return p === e || p === local || (local.length >= 3 && p.includes(local))
}

/** Client-side mirror of the backend's registration rules, for instant feedback. */
function validateRegistration(email: string, password: string): string | null {
  if (!EMAIL_FORMAT_RE.test(email.trim())) {
    return 'El correo debe tener un formato real (usuario@dominio.com)'
  }
  if (!PASSWORD_POLICY_RE.test(password)) {
    return 'La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial'
  }
  if (passwordMatchesEmail(password, email)) {
    return 'La contraseña no puede ser igual a tu correo, ni contenerlo'
  }
  return null
}

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

    if (mode === 'register') {
      const validationError = validateRegistration(email, password)
      if (validationError) {
        setError(validationError)
        return
      }
    }

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
        // Backend validation failures (400) come back as { error, fields: [...] };
        // surface the field-level messages instead of the generic "Validation failed".
        const detail = Array.isArray(body?.fields) && body.fields.length > 0
          ? body.fields.join(' · ')
          : body?.error
        setError(detail ?? `Error ${err.status}`)
      } else {
        setError('No se pudo conectar con el servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => { setError(null); setMode(mode === 'login' ? 'register' : 'login') }

  return (
    <div className="rfl">
      {/* Scene: contour mesh + self-drawing GPS route behind the glass */}
      <div className="rfl-scene" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {[180, 320, 460, 600].map(y => (
            <path key={`c-${y}`} className="rfl-contour"
              d={`M-40,${y} C280,${y - 80} 560,${y + 70} 820,${y - 20} S1160,${y + 60} 1260,${y - 30}`} />
          ))}
        </svg>
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <path className="rfl-route" d={ROUTE} />
          <circle className="rfl-head-ring" cx="350" cy="250" r="5" />
          <circle className="rfl-head" cx="350" cy="250" r="5" />
        </svg>
      </div>
      <div className="rfl-grain" aria-hidden="true" />

      {/* Brand */}
      <div className="rfl-brand">
        <img src="/logo.png" alt="RaceFlow" />
        <h1>RACE<b>FLOW</b></h1>
      </div>

      {/* Auth card: form panel + branded aside slide past each other on toggle */}
      <div className="rfl-auth" data-mode={mode}>
        <section className="rfl-formcol">
          <div className="rfl-formcard" key={mode}>
            <h2 className="rfl-h2">{mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}</h2>
            <p className="rfl-sub">
              {mode === 'login' ? 'Inicia sesión para entrenar con tu equipo' : 'Regístrate para empezar a entrenar'}
            </p>

            <form onSubmit={handleSubmit} className="rfl-form">
              {mode === 'register' && (
                <div className="rfl-field">
                  <label>Nombre completo</label>
                  <input data-testid="register-name" type="text" placeholder="Juan Sebastián"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}

              {error && <p className="rfl-error">{error}</p>}

              <div className="rfl-field">
                <label>Correo electrónico</label>
                <input data-testid="login-email" type="email" placeholder="atleta@ejemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="rfl-field">
                <div className="rfl-label-row">
                  <label>Contraseña</label>
                  {mode === 'login' && <span className="rfl-forgot">¿Olvidaste tu contraseña?</span>}
                </div>
                <input data-testid="login-password" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPass(e.target.value)} />
                {mode === 'register' && (
                  <p className="rfl-hint">
                    Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
                    No puede ser igual a tu correo.
                  </p>
                )}
              </div>

              <button data-testid="auth-submit" type="submit" className="rfl-submit" disabled={loading}>
                {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </section>

        <aside className="rfl-aside">
          <div key={mode} className="rfl-formcard">
            <h3>{mode === 'login' ? '¡BIENVENIDO DE NUEVO!' : '¡ÚNETE A LA MANADA!'}</h3>
            <p>
              {mode === 'login'
                ? '¿Aún no tienes cuenta? Crea una y entrena en vivo con tu equipo.'
                : '¿Ya entrenas con nosotros? Inicia sesión y vuelve a la ruta.'}
            </p>
            <button type="button" data-testid="auth-toggle-mode" className="rfl-ghost" onClick={toggle}>
              {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </div>
        </aside>
      </div>

      <p className="rfl-foot">AUTH SERVICE · REST · #authenticate</p>
    </div>
  )
}
