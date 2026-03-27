import * as z from 'zod';

export const chargeTypeSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  defaultAmount: z.number().min(0, 'O valor não pode ser negativo').optional(),
  isRecurring: z.boolean(),
  active: z.boolean(),
  // Campos de regra de recorrência (opcionais, usados se isRecurring for true)
  frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']),
  recurringAmount: z.number().min(0, 'O valor não pode ser negativo').optional()
});

export type ChargeTypeFormValues = z.infer<typeof chargeTypeSchema>;
