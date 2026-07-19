# E2E (Playwright)

Cubre el flujo de onboarding real: registro → Salas → crear sala → aterrizar
en el mapa en vivo de esa sala. Corre contra un backend real (auth-service +
realtime-service vía el gateway) -- no hay mocks/dobles de API aquí.

## Correr

```bash
pnpm exec playwright install chromium   # una sola vez
pnpm dev                                # servidor local en :5173, en otra terminal
pnpm test:e2e                           # contra localhost:5173 por defecto
```

Contra el frontend ya desplegado en Azure Static Web Apps:

```bash
BASE_URL=https://lively-rock-0066b1e0f.7.azurestaticapps.net pnpm test:e2e
```

## Verificación local (sin backend vivo)

Corrido localmente el 17 de julio con el backend real apagado (App Service
Plan en tier F1 para ahorrar créditos, ver `raceflow-observability`): el
test navega, encuentra todos los `data-testid`, llena el formulario, y
envía correctamente -- falla solo en la aserción de redirección a `/salas`
porque `VITE_API_AUTH` no responde. Confirma que la estructura del test y
los selectores son correctos; la corrida completa contra el backend real
queda pendiente para cuando se reactive (lunes, antes de las pruebas).
