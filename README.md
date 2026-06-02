# KatchUp Frontend

Frontend Angular para el sistema de gestión financiera familiar KatchUp.

## Stack
- **Framework:** Angular 17 (Standalone Components)
- **UI:** PrimeNG 17 + PrimeFlex
- **Gráficos:** Chart.js
- **Autenticación:** JWT (localStorage)

## Estructura de carpetas

```
src/app/
├── core/
│   ├── guards/         # authGuard, guestGuard
│   ├── interceptors/   # authInterceptor (añade JWT a cada request)
│   └── services/       # auth, familia, gastos, ingresos, metas, reglas, notificaciones
├── shared/
│   ├── components/layout/   # Sidebar + topbar principal
│   └── models/              # Todas las interfaces TypeScript
├── features/
│   ├── auth/login/          # Pantalla de login
│   ├── auth/register/       # Pantalla de registro (2 pasos)
│   ├── dashboard/           # Dashboard financiero con KPIs y gráficos
│   ├── gastos/              # Registro y listado de gastos
│   ├── metas-ahorro/        # Metas con progreso y abonos
│   ├── simulador/           # Simulador financiero con sliders
│   ├── reglas-automaticas/  # Reglas automáticas con toggle
│   └── familia/             # Gestión de miembros del grupo familiar
├── app.routes.ts            # Rutas con lazy loading
├── app.config.ts            # Configuración de la app
└── app.component.ts         # Root component
```

## Setup local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar la URL del backend
Editar `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // URL de tu backend NestJS
};
```

### 3. Correr en desarrollo
```bash
npm start
# App disponible en http://localhost:4200
```

### 4. Build para producción
```bash
npm run build:prod
# Archivos en dist/katchup-front/
```

## Deploy en Vercel

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Import desde GitHub
3. Framework preset: **Angular**
4. Agregar variable de entorno: `VITE_API_URL=https://tu-backend.railway.app/api`
5. En `vercel.json` agregar rewrites para SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Pantallas incluidas

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Login | `/auth/login` | Inicio de sesión con email/password |
| Registro | `/auth/register` | Registro en 2 pasos: cuenta + familia |
| Dashboard | `/dashboard` | KPIs, gráfico de tendencia, metas y últimos gastos |
| Gastos | `/gastos` | Listado por mes + modal registrar gasto |
| Metas de Ahorro | `/metas-ahorro` | Tarjetas de metas con progreso y abonos |
| Simulador | `/simulador` | Sliders de escenarios + regla 50/30/20 |
| Reglas Automáticas | `/reglas-automaticas` | Listado con toggle activar/desactivar |
| Familia | `/familia` | Gestión de miembros con roles y límites |

## Seguridad
- JWT almacenado en `localStorage` con key `katchup_token`
- `authInterceptor` añade el token a cada request HTTP automáticamente
- `authGuard` protege todas las rutas del layout principal
- `guestGuard` redirige al dashboard si ya está autenticado
