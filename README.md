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

---

## Pantallas y flujos

---

## Comunicacion con el backend

---

## Pruebas y calidad

---

## CI/CD

