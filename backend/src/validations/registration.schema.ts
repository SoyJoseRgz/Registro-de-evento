import { z } from 'zod';

export const registerAttendeeSchema = z.object({
  attendeeName: z.string().min(1, 'Name is required'),
  attendeeEmail: z.string().email('Invalid email'),
  attendeePhone: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

export const updateRegistrationSchema = z.object({
  attendeeName: z.string().min(1).optional(),
  attendeeEmail: z.string().email().optional(),
  attendeePhone: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});
