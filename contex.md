# Contexto del Proyecto: Registro de Eventos

## Descripcion General
Sistema multi-tenant para gestion de eventos. Permite a multiples empresas crear eventos, gestionar registros de asistentes, controlar aforo, realizar check-in por QR y generar reportes. Incluye web publica para visualizacion de eventos y dashboard privado para gestion.

## Arquitectura

### Stack Tecnologico
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Base de datos**: PostgreSQL
- **Contenedores**: Docker + Docker Compose
- **Despliegue**: VPS (4-8GB RAM)
- **Frontend hosting**: Mismo VPS con Nginx

### Multi-tenancy
- Una instancia sirve a multiples empresas
- Datos separados por `tenant_id` en todas las tablas principales
- Cada empresa tiene sus propios campos de registro, eventos y configuracion

### API
- REST API versionada (`/api/v1/...`)
- Rate limiting basico implementado
- Consumidores: Web app (Next.js) + WhaConnect (workflows)

## Modelos de Datos Principales

### Tenant (Empresa)
```
id, name, slug, logo_url, config (json), created_at, updated_at
```

### User (Usuarios del sistema)
```
id, tenant_id, email, password_hash, name, role (admin|organizer|assistant), created_at
```

### Event (Eventos)
```
id, tenant_id, title, description, event_type (conference|workshop|meetup|webinar|other)
location, start_date, end_date, capacity, status (draft|published|cancelled|completed)
created_by, created_at, updated_at
```

### RegistrationField (Campos custom de registro por tenant)
```
id, tenant_id, field_name, field_type (text|email|phone|number|select|checkbox|textarea)
options (json, para select), is_required, display_order, created_at
```

### Registration (Registros de asistentes)
```
id, event_id, tenant_id, attendee_name, attendee_email, attendee_phone
custom_fields (json, valores de campos custom), qr_code, status (pending|confirmed|cancelled|checked_in)
registered_at, checked_in_at
```

### CheckIn (Historial de check-in)
```
id, registration_id, event_id, checked_in_by, checked_in_at, method (qr|manual)
```

## Funcionalidades

### 1. Gestion de Eventos (CRUD)
- Crear, editar, eliminar eventos
- Tipos: conferencia, taller, meetup, webinar, otro
- Estados: borrador, publicado, cancelado, completado
- Control de capacidad (aforo)

### 2. Registro Dinamico
- Cada tenant define sus propios campos de registro
- Campos tipados: texto, email, telefono, numero, select, checkbox, textarea
- Campos opcionales o requeridos
- Orden de visualizacion configurable

### 3. Registro de Asistentes
- Formulario publico por evento (accesible via link unico)
- Validacion de capacidad maxima
- Generacion automatica de QR code
- Confirmacion via WhatsApp (WhaConnect)

### 4. Check-in por QR
- Escanear QR en el momento del evento
- Validacion de registro existente
- Prevencion de check-in duplicado
- Metodo manual como fallback

### 5. Reportes
- **Tasa de asistencia**: registrados vs asistidos por evento
- **Exportacion**: datos a Excel/CSV
- **Dashboard visual**: graficas de tendencias, demografia basica

### 6. Autenticacion y Roles
- **Admin**: acceso total a su tenant
- **Organizador**: gestionar eventos y ver registros
- **Asistente**: editar sus datos, cancelar su registro

### 7. Web Publica
- Landing page con eventos publicados
- Vista detallada de cada evento
- Formulario de registro integrado

### 8. Integraciones
- **WhaConnect**: notificaciones WhatsApp (confirmacion, recordatorios)
- Webhooks para eventos de registro/check-in

## Endpoints Principales (v1)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register` (solo admin crea usuarios)

### Events
- `GET /api/v1/events` (listar, filtrar por tenant)
- `GET /api/v1/events/:id`
- `POST /api/v1/events` (admin/organizer)
- `PUT /api/v1/events/:id` (admin/organizer)
- `DELETE /api/v1/events/:id` (admin)

### Registrations
- `GET /api/v1/events/:eventId/registrations`
- `POST /api/v1/events/:eventId/register` (publico, con tenant_id en URL)
- `GET /api/v1/registrations/:id`
- `PUT /api/v1/registrations/:id` (asistente, solo sus datos)
- `DELETE /api/v1/registrations/:id` (cancelar registro)

### Check-in
- `POST /api/v1/checkin` (escanear QR)
- `GET /api/v1/events/:eventId/checkins` (lista de asistentes)

### Reports
- `GET /api/v1/events/:eventId/report` (estadisticas)
- `GET /api/v1/events/:eventId/export` (CSV/Excel)

### Registration Fields (custom)
- `GET /api/v1/tenants/:tenantId/fields`
- `POST /api/v1/tenants/:tenantId/fields`
- `PUT /api/v1/tenants/:tenantId/fields/:id`
- `DELETE /api/v1/tenants/:tenantId/fields/:id`

## Estructura de Directorios

```
registro-eventos/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── nginx/
│   └── default.conf
└── contex.md
```

## Dependencias Clave

### Backend
- express, typescript, prisma (ORM), jsonwebtoken, bcryptjs
- qrcode (generacion QR), multer (uploads), cors, helmet
- express-rate-limit, uuid, date-fns

### Frontend
- next, react, tailwindcss, axios
- @tanstack/react-query, react-hook-form, zod
- recharts (graficas), qrcode.react (QR viewer)

## Notas Importantes

- **WhaConnect**: Servicio externo para notificaciones WhatsApp. Pendiente documentacion para integrar webhooks y callbacks.
- **Campos custom**: Almacenados en JSON en la tabla Registration. El schema se valida dinamicamente segun los campos del tenant.
- **QR Code**: Generado al registrar, contiene el registration_id. Validado en check-in.
- **Rate limiting**: Basico por IP, configurable por endpoint.

## Proximo Paso
1. Subir documentacion de WhaConnect a contex.md
2. Definir esquema completo de Prisma
3. Implementar backend (controllers, routes, services)
4. Implementar frontend (pages, components)
5. Configurar Docker y despliegue
