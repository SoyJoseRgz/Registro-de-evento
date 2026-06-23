# Registro de Eventos

Sistema multi-tenant para gestion de eventos y registros de asistentes.

## Caracteristicas

- Multi-tenant: una instancia sirve a multiples empresas
- CRUD de eventos con estados (draft, published, cancelled, completed)
- Registro dinamico con campos personalizados por tenant
- Check-in por QR code
- Reportes y exportacion CSV
- Notificaciones WhatsApp via WhaConnect

## Stack Tecnologico

- **Backend**: Node.js, Express, TypeScript, Prisma
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Base de datos**: SQLite (archivos locales)
- **Despliegue**: Node.js

## Instalacion

### Requisitos
- Node.js 18+

### Inicio rapido

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

El sistema estara disponible en http://localhost:3000

## Credenciales de Prueba

Despues de ejecutar el seed:

- **Email**: admin@demo.com
- **Password**: admin123
- **Tenant**: demo

## API Endpoints

### Auth
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/refresh
- GET /api/v1/auth/me

### Events (requiere tenantId)
- GET /api/v1/tenants/:tenantId/events
- GET /api/v1/tenants/:tenantId/events/:slug
- POST /api/v1/tenants/:tenantId/events
- PUT /api/v1/tenants/:tenantId/events/:id
- DELETE /api/v1/tenants/:tenantId/events/:id

### Registrations
- GET /api/v1/tenants/:tenantId/events/:eventId/registrations
- POST /api/v1/tenants/:tenantId/events/:eventId/register
- GET /api/v1/tenants/:tenantId/registrations/:id
- PUT /api/v1/tenants/:tenantId/registrations/:id
- DELETE /api/v1/tenants/:tenantId/registrations/:id

### Check-in
- POST /api/v1/tenants/:tenantId/checkin
- GET /api/v1/tenants/:tenantId/events/:eventId/checkins

### Reports
- GET /api/v1/tenants/:tenantId/events/:eventId/report
- GET /api/v1/tenants/:tenantId/events/:eventId/report/export

### Fields
- GET /api/v1/tenants/:tenantId/fields
- POST /api/v1/tenants/:tenantId/fields
- PUT /api/v1/tenants/:tenantId/fields/:id
- DELETE /api/v1/tenants/:tenantId/fields/:id
