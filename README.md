# RACEFLOW — Frontend

> [!IMPORTANT]
> Este repositorio contiene el **Frontend** de RaceFlow: la aplicacion web de entrenamiento deportivo colaborativo en tiempo real.

> Para informacion general consulta el [perfil de la organizacion](https://github.com/RaceFlowECI).

---

## Tabla de contenido
- [Descripcion general](#descripcion-general)
- [Stack tecnologico](#stack-tecnologico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuracion local](#configuracion-local)
- [Pantallas y flujos](#pantallas-y-flujos)
- [Comunicacion con el backend](#comunicacion-con-el-backend)
- [Pruebas y calidad](#pruebas-y-calidad)
- [CI/CD](#cicd)

---

## Descripcion general

> [!NOTE]
> Interfaz web SPA que permite a los atletas crear o unirse a salas de entrenamiento, compartir posicion GPS en tiempo real y visualizar el ranking sobre un mapa interactivo.

### Funcionalidades principales

| Funcionalidad | Descripcion |
|---|---|
| **Registro y login** | El atleta crea su cuenta o inicia sesion. El JWT se almacena en memoria. |
| **Crear sala** | El atleta ingresa nombre y deporte; recibe un codigo de 6 digitos para compartir. |
| **Unirse a sala** | El atleta ingresa el codigo y accede a la sesion activa. |
| **Mapa en tiempo real** | Mapa OpenStreetMap (Leaflet.js) que actualiza la posicion de cada participante via WebSocket. |
| **Ranking en vivo** | Tabla lateral con el ranking recalculado en cada actualizacion GPS. |
| **Historial** | Vista de sesiones finalizadas con posiciones finales y tiempo total. |

---

## Stack tecnologico

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)

### Comunicacion
![REST](https://img.shields.io/badge/REST-FF6C37?style=for-the-badge)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

### Testing y calidad
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testinglibrary&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

### DevOps
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Estructura del proyecto

```text
raceflow-frontend/
├── .github/workflows/
├── .env.example
├── .gitignore
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
├── public/
│   └── vite.svg
└── src/
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── assets/
    │   └── react.svg
    ├── api/
    │   ├── authApi.ts
    │   ├── roomApi.ts
    │   ├── sessionApi.ts
    │   └── websocketClient.ts
    ├── components/
    │   ├── map/
    │   │   ├── RaceMap.tsx
    │   │   └── PlayerMarker.tsx
    │   ├── ranking/
    │   │   └── RankingTable.tsx
    │   └── ui/
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── RoomPage.tsx
    │   ├── HistoryPage.tsx
    │   └── MetricsPage.tsx
    ├── hooks/
    │   ├── useWebSocket.ts
    │   ├── useGeolocation.ts
    │   └── useAuth.ts
    ├── router/
    │   └── index.tsx
    ├── store/
    ├── types/
    └── utils/
```

---

## Configuracion local

### 1. Clonar el repositorio
```bash
git clone https://github.com/RaceFlowECI/raceflow-frontend.git
cd raceflow-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
```env
VITE_API_GATEWAY_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

> [!WARNING]
> Nunca subas credenciales reales. El archivo `.env` esta en `.gitignore`.

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
> [!TIP]
> La aplicacion estara disponible en `http://localhost:5173`.

### Build de produccion y Docker
```bash
npm run build
docker build -t raceflow-frontend .
docker run -d -p 80:80 raceflow-frontend
```

---

## Pantallas y flujos

| Ruta | Pantalla | Descripcion |
|---|---|---|
| `/login` | Login | Autenticacion con email y password |
| `/register` | Registro | Creacion de cuenta nueva |
| `/dashboard` | Dashboard | Crear sala o ingresar codigo |
| `/room/:code` | Sala activa | Mapa + ranking en tiempo real |
| `/history` | Historial | Sesiones finalizadas del atleta |
| `/metrics` | Metricas | KPIs de la plataforma |

---

## Comunicacion con el backend

| Tipo | Endpoint | Descripcion |
|---|---|---|
| REST POST | `/auth/register` | Registro (Auth Service) |
| REST POST | `/auth/login` | Login y JWT (Auth Service) |
| REST GET | `/auth/me` | Perfil del atleta (Auth Service) |
| REST POST | `/rooms` | Crear sala (Room Service) |
| REST POST | `/rooms/join` | Unirse por codigo (Room Service) |
| REST GET | `/sessions/history` | Historial (Session Service) |
| REST GET | `/metrics/kpis` | KPIs (Metrics Service) |
| WebSocket | `/ws/rooms/{code}` | Stream GPS + ranking (Realtime Service) |

---

## Pruebas y calidad
```bash
npm run test
npm run coverage
npm run lint
```

---

## CI/CD

| Campo | Valor |
|---|---|
| Plataforma | Vercel |
| URL del servicio | _por definir_ |
| Ultima version | ![CI](https://github.com/RaceFlowECI/raceflow-frontend/actions/workflows/ci.yml/badge.svg) |
