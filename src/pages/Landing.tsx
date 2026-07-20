import { Link } from 'react-router-dom'
import './Landing.css'

// Live-ranking mock for the leaderboard (demo content, same spirit as before).
const BOARD = [
  { pos: 1, name: 'Ana Rodríguez', km: '12.4', width: '96%', lead: true },
  { pos: 2, name: 'Juan Guayazán', km: '11.8', width: '88%', lead: false },
  { pos: 3, name: 'Camila Torres', km: '10.9', width: '79%', lead: false },
  { pos: 4, name: 'Diego Marín',   km: '9.6',  width: '68%', lead: false },
]

const FEATURES = [
  {
    num: 'F.01', title: 'Posición en vivo',
    sub: 'Todo el grupo moviéndose en el mapa, sin refrescar.',
    bullets: ['Coordenadas por WebSocket', 'Trayectoria dibujada en vivo', 'Cero recargas'],
  },
  {
    num: 'F.02', title: 'Ranking instantáneo',
    sub: 'El orden cambia con cada metro recorrido.',
    bullets: ['Recálculo con cada posición', 'SLO p99 ≤ 1 segundo', 'Distancia por Haversine'],
  },
  {
    num: 'F.03', title: 'Chat de voz P2P',
    sub: 'Habla con tu manada mientras entrenas.',
    bullets: ['Audio directo vía WebRTC', 'El servidor solo señaliza', 'Silencia y cuelga a un toque'],
  },
  {
    num: 'F.04', title: 'Amigos e invitaciones',
    sub: 'Arma tu grupo y entrena en manada.',
    bullets: ['Solicitudes de amistad', 'Invita a tu sala a un toque', 'O comparte un código de 6'],
  },
]

// Verifiable capability metrics — defensible under questioning, not a fake user count.
const GAUGES = [
  { v: '6',    l: 'microservicios\nindependientes' },
  { v: '<1s',  l: 'ranking recalculado\n(p99)' },
  { v: '100%', l: 'en tiempo real\nvía WebSocket' },
  { v: 'P2P',  l: 'audio directo\nentre atletas' },
]

const SPLITS = [
  { id: 'lead',  content: <><em>▲2</em> Ana toma la delantera</> },
  { id: 'room',  content: <>Sala <em>K7X2M9</em> · 4 atletas</> },
  { id: 'recalc', content: <>Ranking recalculado en <em>212ms</em></> },
  { id: 'join',  content: <><span className="h">+1</span> Diego se unió a la sala</> },
  { id: 'voice', content: <>Chat de voz · <em>3</em> en llamada</> },
  { id: 'gps',   content: <>Traza GPS <em>4.812°N 74.081°W</em></> },
]

// A hand-drawn "recorded route" for the hero map (viewBox 0 0 400 400).
const ROUTE = 'M40,300 C70,250 60,200 110,180 S180,200 200,150 S250,80 300,110 S360,180 340,240 S280,300 250,280'
const WAYPOINTS: [number, number][] = [[40, 300], [110, 180], [200, 150], [300, 110], [340, 240]]

export default function Landing() {
  return (
    <div className="rf">
      <div className="rf-atmos" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {[160, 280, 400, 520, 640].map(y => (
            <path key={`contour-${y}`} className="rf-contour"
              d={`M-40,${y} C260,${y - 70} 520,${y + 70} 760,${y - 20} S1120,${y + 60} 1260,${y - 30}`} />
          ))}
        </svg>
      </div>
      <div className="rf-grain" aria-hidden="true" />

      <div className="rf-frame" aria-hidden="true">
        <span className="tl">04°36′35″N</span><span className="tr">REC · GPS LOCK</span>
        <span className="bl">74°04′54″W</span><span className="br">RACEFLOW / ARSW·26</span>
      </div>

      <div className="rf-shell">
        {/* NAV */}
        <nav className="rf-nav">
          <a className="rf-word" href="/"><img src="/logo.png" alt="" /> RACE<b>FLOW</b></a>
          <div className="rf-nav-right">
            <span className="rf-coord">LAT 4.6097 · LNG −74.0817</span>
            <Link className="rf-signin" to="/login">Iniciar sesión</Link>
          </div>
        </nav>

        {/* HERO */}
        <header className="rf-hero">
          <div>
            <span className="rf-tag"><i />Salas de entrenamiento en tiempo real</span>
            <h1>
              Entrena en <span className="heat">manada</span>.<br />
              Compite en <span className="teal">vivo</span>.
            </h1>
            <p className="rf-lede">
              RaceFlow convierte cada salida a entrenar en una carrera compartida:
              GPS en vivo de todo tu grupo, ranking que cambia con cada metro y chat
              de voz para no correr en silencio. Estén donde estén.
            </p>
            <div className="rf-cta">
              <Link className="rf-btn rf-btn-fill" to="/login">Crear cuenta</Link>
              <Link className="rf-btn rf-btn-line" to="/login">Ya tengo cuenta</Link>
            </div>
            <dl className="rf-readout">
              <div><dt>Pace prom.</dt><dd>5:12</dd></div>
              <div><dt>Atletas</dt><dd>4</dd></div>
              <div><dt>Latencia</dt><dd>212ms</dd></div>
            </dl>
          </div>

          {/* Signature: self-drawing live route */}
          <div className="rf-map" aria-label="Traza GPS en vivo de ejemplo">
            <svg className="rf-map-grid" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true">
              {[80, 160, 240, 320].map(v => <line key={`h${v}`} x1="0" y1={v} x2="400" y2={v} />)}
              {[80, 160, 240, 320].map(v => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="400" />)}
            </svg>
            <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path className="rf-route-ghost" d={ROUTE} />
              <path className="rf-route" d={ROUTE} />
              {WAYPOINTS.map(([x, y], i) => (
                <circle key={`wp-${x}-${y}`} className="rf-wp" cx={x} cy={y} r="5"
                  style={{ animationDelay: `${1 + i * 0.55}s` }} />
              ))}
              <circle className="rf-head-ring" cx="250" cy="280" r="6" />
              <circle className="rf-head" cx="250" cy="280" r="6" />
            </svg>
            <div className="rf-map-hud">
              <div className="rf-hud-row">
                <span className="rf-rec"><i />REC · EN VIVO</span>
                <span className="rf-hud-coord">SALA K7X2M9<br />4.6097°N · 74.0817°W</span>
              </div>
              <div className="rf-hud-row">
                <div className="rf-hud-stat">
                  <div><b>12.4</b><span>KM · líder</span></div>
                  <div className="hot"><b>00:41:18</b><span>tiempo</span></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* SPLIT FEED */}
        <div className="rf-splits" aria-hidden="true">
          <div className="rf-splits-track">
            {SPLITS.map(s => <span key={s.id}>{s.content}</span>)}
            {SPLITS.map(s => <span key={`dup-${s.id}`}>{s.content}</span>)}
          </div>
        </div>

        {/* INSTRUMENT CLUSTER */}
        <section className="rf-cluster" aria-label="RaceFlow en números">
          {GAUGES.map(g => (
            <div key={g.l} className="rf-gauge">
              <b>{g.v}</b><span>{g.l}</span>
            </div>
          ))}
        </section>

        {/* FEATURES */}
        <section className="rf-feat">
          <div className="rf-feat-head">
            <h2>Todo tu equipo,<br />un solo pulso</h2>
            <p>04 capacidades · en producción</p>
          </div>
          {FEATURES.map(f => (
            <article key={f.num} className="rf-row">
              <div className="rf-row-num">{f.num}</div>
              <div className="rf-row-title">{f.title}<small>{f.sub}</small></div>
              <ul className="rf-row-bul">{f.bullets.map(b => <li key={b}>{b}</li>)}</ul>
            </article>
          ))}
        </section>

        {/* LEADERBOARD */}
        <section className="rf-board-wrap" aria-label="Ejemplo de ranking en vivo">
          <div className="rf-board">
            <div className="rf-board-top">
              <span>Sala K7X2M9 · ranking</span>
              <span className="live"><i />En vivo</span>
            </div>
            {BOARD.map(r => (
              <div key={r.pos} className={`rf-bib${r.lead ? ' lead' : ''}`}>
                <span className="rf-bib-pos">{String(r.pos).padStart(2, '0')}</span>
                <span className="rf-bib-name">{r.name}</span>
                <span className="rf-bib-km">{r.km} km</span>
                <span className="rf-bib-bar"><i style={{ width: r.width }} /></span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rf-end">
          <h2>Tu próxima salida no tiene por qué ser en <span className="teal">solitario</span></h2>
          <p>Crea tu cuenta, arma una sala e invita a tu equipo en menos de un minuto.</p>
          <Link className="rf-btn rf-btn-fill" to="/login">Entrar a RaceFlow</Link>
        </section>

        <footer className="rf-foot">
          <span><b>RACEFLOW</b> · entrenamiento colaborativo en tiempo real</span>
          <span>ARSW 2026·1 — Escuela Colombiana de Ingeniería Julio Garavito</span>
        </footer>
      </div>
    </div>
  )
}
