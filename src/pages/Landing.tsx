import { Link } from 'react-router-dom'
import './Landing.css'

const RANKING = [
  { pos: 1, name: 'Ana Rodríguez', km: '12.4 km', width: '96%', leader: true },
  { pos: 2, name: 'Juan Guayazán', km: '11.8 km', width: '88%', leader: false },
  { pos: 3, name: 'Camila Torres', km: '10.9 km', width: '79%', leader: false },
  { pos: 4, name: 'Diego Marín', km: '9.6 km', width: '68%', leader: false },
]

const FEATURES = [
  {
    num: '01 / GPS',
    title: 'Posición en vivo',
    body: 'Todo el grupo moviéndose en el mapa, sin refrescar.',
    bullets: ['Coordenadas por WebSocket', 'Trayectoria dibujada en vivo', 'Cero recargas'],
  },
  {
    num: '02 / Ranking',
    title: 'Ranking instantáneo',
    body: 'El orden cambia con cada metro recorrido.',
    bullets: ['Recálculo con cada posición', 'SLO p99 ≤ 1 segundo', 'Distancia por Haversine'],
  },
  {
    num: '03 / Voz',
    title: 'Chat de voz P2P',
    body: 'Habla con tu manada mientras entrenas.',
    bullets: ['Audio directo vía WebRTC', 'El servidor solo señaliza', 'Silencia y cuelga a un toque'],
  },
  {
    num: '04 / Equipo',
    title: 'Amigos e invitaciones',
    body: 'Arma tu grupo y entrena en manada.',
    bullets: ['Solicitudes de amistad', 'Invita a tu sala a un toque', 'O comparte un código de 6'],
  },
]

// Capability metrics — every number is verifiable from the real architecture,
// so it holds up under questioning (defensible in a defense), unlike a fake
// user count. Presented Strava-style as a big-number social-proof band.
const STATS = [
  { num: '6',    label: 'Microservicios independientes' },
  { num: '<1s',  label: 'Ranking recalculado (p99)' },
  { num: '100%', label: 'En tiempo real vía WebSocket' },
  { num: 'P2P',  label: 'Audio directo entre atletas' },
]

const TICKER_ITEMS = [
  { id: 'lead',    content: <><em>▲ 2</em> Ana toma la delantera</> },
  { id: 'room',    content: <>Sala <em>K7X2M9</em> activa · 4 atletas</> },
  { id: 'ranking', content: <>Ranking recalculado en <em>212 ms</em></> },
  { id: 'join',    content: <><em>+1</em> Diego se unió a la sala</> },
  { id: 'voice',   content: <>Chat de voz · <em>3</em> en llamada</> },
]

/**
 * Public marketing landing served at "/". Presents the product and funnels
 * visitors to the existing /login flow — it does not replace it.
 */
export default function Landing() {
  return (
    <div className="rf-landing">
      <div className="rf-backdrop" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <path className="rf-contour" d="M-50,220 C200,140 420,300 640,210 C860,120 1060,260 1250,180" />
          <path className="rf-contour" d="M-50,320 C220,240 440,400 660,310 C880,220 1080,360 1250,280" />
          <path className="rf-contour" d="M-50,430 C240,350 460,510 680,420 C900,330 1100,470 1250,390" />
          <path className="rf-contour" d="M-50,540 C260,460 480,620 700,530 C920,440 1120,580 1250,500" />
          <path className="rf-contour" d="M-50,650 C280,570 500,730 720,640 C940,550 1140,690 1250,610" />
        </svg>
      </div>

      <nav className="rf-nav">
        <a className="rf-brand" href="/">
          <img src="/logo.png" alt="" />
          <span>RACEFLOW</span>
        </a>
        <Link className="rf-nav-cta" to="/login">Iniciar sesión</Link>
      </nav>

      <header className="rf-hero">
        <div>
          <span className="rf-kicker">Salas de entrenamiento en tiempo real</span>
          <h1>
            Entrena en <em>manada</em>,<br />
            compite en <em>vivo</em>.
          </h1>
          <p>
            RaceFlow convierte cada salida a entrenar en una carrera compartida:
            GPS en vivo de todo tu grupo, ranking que cambia con cada metro
            recorrido y chat de voz para no correr en silencio. Estén donde estén.
          </p>
          <div className="rf-hero-actions">
            <Link className="rf-btn-solid" to="/login">Crear cuenta</Link>
            <Link className="rf-btn-ghost" to="/login">Ya tengo cuenta</Link>
          </div>
        </div>

        <aside className="rf-rank-card" aria-label="Ejemplo de ranking en vivo">
          <div className="rf-rank-head">
            <span>Sala K7X2M9</span>
            <span className="rf-live">En vivo</span>
          </div>
          {RANKING.map(r => (
            <div key={r.pos} className={`rf-rank-row${r.leader ? ' is-leader' : ''}`}>
              <span className="rf-rank-pos">{r.pos}</span>
              <span className="rf-rank-name">{r.name}</span>
              <span className="rf-rank-km">{r.km}</span>
              <span className="rf-rank-bar"><i style={{ width: r.width }} /></span>
            </div>
          ))}
          <div className="rf-rank-foot">
            <span className="rf-rank-badge">🔥 Racha 12 días</span>
            <span className="rf-rank-level">Nivel 8 · líder de la manada</span>
          </div>
        </aside>
      </header>

      <div className="rf-ticker" aria-hidden="true">
        <div className="rf-ticker-track">
          {/* Rendered twice so the -50% marquee translation loops seamlessly */}
          {TICKER_ITEMS.map(item => <span key={item.id}>{item.content}</span>)}
          {TICKER_ITEMS.map(item => <span key={`dup-${item.id}`}>{item.content}</span>)}
        </div>
      </div>

      <section className="rf-stats" aria-label="RaceFlow en números">
        {STATS.map(s => (
          <div key={s.label} className="rf-stat">
            <span className="rf-stat-num">{s.num}</span>
            <span className="rf-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="rf-features">
        <span className="rf-section-tag">Qué hace RaceFlow</span>
        <h2>Todo tu equipo, un solo pulso</h2>
        <p className="rf-features-hint" aria-hidden="true">Desliza para ver las 4 →</p>
        <div className="rf-feature-track">
          {FEATURES.map(f => (
            <article key={f.num} className="rf-feature">
              <span className="rf-feature-num">{f.num}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <ul className="rf-feature-bullets">
                {f.bullets.map(b => <li key={b}>{b}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rf-cta">
        <span className="rf-section-tag">Empieza hoy</span>
        <h2>Tu próxima salida no tiene por qué ser en solitario</h2>
        <p>Crea tu cuenta, arma una sala e invita a tu equipo en menos de un minuto.</p>
        <Link className="rf-btn-solid" to="/login">Entrar a RaceFlow</Link>
      </section>

      <footer className="rf-footer">
        <span><b>RACEFLOW</b> · Entrenamiento deportivo colaborativo en tiempo real</span>
        <span>ARSW 2026-1 · Escuela Colombiana de Ingeniería Julio Garavito</span>
      </footer>
    </div>
  )
}
