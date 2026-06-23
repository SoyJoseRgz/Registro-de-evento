import { z } from 'zod';

export const createFieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  fieldType: z.enum(['text', 'email', 'phone', 'number', 'select', 'checkbox', 'textarea']),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export const updateFieldSchema = createFieldSchema.partial();
