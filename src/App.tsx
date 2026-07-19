import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login   from './pages/Login'
import Salas   from './pages/Salas'
import Amigos  from './pages/Amigos'
import Mapa    from './pages/Mapa'
import Ranking from './pages/Ranking'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/salas"         element={<Salas />} />
        <Route path="/amigos"        element={<Amigos />} />
        <Route path="/sala/:id/mapa" element={<Mapa />} />
        <Route path="/sala/:id/ranking" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  )
}
