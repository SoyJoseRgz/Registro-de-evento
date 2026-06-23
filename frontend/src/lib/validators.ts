import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
  tenantSlug: z.string().optional(),
});

export const registerEventSchema = z.object({
  attendeeName: z.string().min(1, 'Nombre es requerido'),
  attendeeEmail: z.string().email('Email invalido'),
  attendeePhone: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Titulo es requerido'),
  description: z.string().optional(),
  eventType: z.enum(['conference', 'workshop', 'meetup', 'webinar', 'other']),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Fecha de inicio es requerida'),
  endDate: z.string().min(1, 'Fecha de fin es requerida'),
  capacity: z.number().int().positive('Capacidad debe ser positiva'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterEventInput = z.infer<typeof registerEventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;