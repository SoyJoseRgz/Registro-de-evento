# API WhaConnect — Registro de Eventos

Endpoints para consumir desde WhaConnect Bot Manager (User Input Flow).

**Base URL:** `https://api.evento.hnet.com.mx/api/v1/whaconnect`

**Formato:** GET con query params. Todas las respuestas son JSON.

---

## 1. Listar eventos disponibles

```
GET /api/v1/whaconnect/events?tenantId={tenantId}
```

### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `tenantId` | string | sí | ID del tenant |

### Respuesta éxito

```json
{
  "success": true,
  "events": [
    {
      "slug": "conferencia-2026-lx3k2j",
      "title": "Conferencia 2026",
      "description": "Descripción del evento",
      "startDate": "2026-08-15T09:00:00.000Z",
      "endDate": "2026-08-15T18:00:00.000Z",
      "location": "Auditorio Principal",
      "capacity": 200,
      "eventType": "conference"
    }
  ]
}
```

### Respuesta error

```json
{
  "success": false,
  "message": "tenantId es requerido"
}
```

---

## 2. Consultar registro existente

```
GET /api/v1/whaconnect/lookup?data={email_o_telefono}&tenantId={tenantId}
```

### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `data` | string | sí | Email o teléfono del asistente |
| `tenantId` | string | sí | ID del tenant |

### Respuesta éxito

```json
{
  "success": true,
  "registration": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "5215512345678",
    "event": "Conferencia 2026",
    "date": "2026-08-15T09:00:00.000Z",
    "location": "Auditorio Principal",
    "status": "confirmed",
    "registeredAt": "2026-07-05T12:30:00.000Z"
  }
}
```

### Respuesta no encontrado

```json
{
  "success": false,
  "message": "No se encontró ningún registro con ese email o teléfono"
}
```

---

## 3. Registrar nuevo asistente

```
GET /api/v1/whaconnect/register?data={nombre},{email},{telefono},{slug_evento}&tenantId={tenantId}
```

### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `data` | string | sí | Valores separados por coma: `nombre,email,telefono,slug_evento` |
| `tenantId` | string | sí | ID del tenant |

### Formato de `data`

```
nombre completo,email,telefono,slug-del-evento
```

**Ejemplo:**
```
Juan Pérez,juan@email.com,5215512345678,conferencia-2026-lx3k2j
```

### Reglas de validación

- El evento debe existir, estar `published` y no haber terminado
- El aforo no debe estar lleno
- No debe existir un registro activo con el mismo email o teléfono en ese evento

### Respuesta éxito

```json
{
  "success": true,
  "message": "Registrado exitosamente en: Conferencia 2026",
  "qrCode": "data:image/png;base64,iVBOR..."
}
```

El `qrCode` es una imagen base64 para el check-in.

### Respuesta error (ejemplos)

```json
{ "success": false, "message": "Evento no encontrado" }
{ "success": false, "message": "El evento está lleno" }
{ "success": false, "message": "Ya estás registrado con ese email" }
{ "success": false, "message": "data debe tener formato: nombre,email,telefono,slug_evento" }
```

---

## Configuración en WhaConnect Bot Manager

En el **User Input Flow**, al final del flujo usa **"Send data to Webhook URL"**:

| Campo | Valor |
|-------|-------|
| Método | `GET` |
| URL | `https://api.evento.hnet.com.mx/api/v1/whaconnect/register?data={variable1},{variable2},{variable3},{variable4}&tenantId=TU_TENANT_ID` |

Reemplaza `{variable1}`, `{variable2}`, etc. por las variables de las respuestas del flujo en el orden correcto:

| Posición | Campo |
|----------|-------|
| variable1 | Nombre completo |
| variable2 | Email |
| variable3 | Teléfono |
| variable4 | Slug del evento |

### Ejemplo de URLs para cada acción

**Registrar:**
```
https://api.evento.hnet.com.mx/api/v1/whaconnect/register?data={nombre},{email},{telefono},{slug}&tenantId=abc-123
```

**Consultar registro:**
```
https://api.evento.hnet.com.mx/api/v1/whaconnect/lookup?data={email_o_telefono}&tenantId=abc-123
```

**Ver eventos disponibles:**
```
https://api.evento.hnet.com.mx/api/v1/whaconnect/events?tenantId=abc-123
```

---

## Notas

- Los endpoints son **GET** públicos (sin autenticación), el `tenantId` funciona como identificador
- Las respuestas siempre tienen `success: true/false` para que el bot pueda manejar el resultado
- Al registrarse, automáticamente se envía un WhatsApp de confirmación al teléfono proporcionado
