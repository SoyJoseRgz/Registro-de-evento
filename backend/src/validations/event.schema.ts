import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventType: z.enum(['conference', 'workshop', 'meetup', 'webinar', 'other']),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  capacity: z.coerce.number().int().positive('Capacity must be positive'),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const updateEventSchema = createEventSchema.partial();
