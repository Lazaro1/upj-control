import * as z from 'zod';

export const paymentAllocationSchema = z.object({
  chargeId: z.string().min(1),
  allocatedAmount: z.number().positive()
});

export const paymentSchema = z.object({
  memberId: z.string().min(1, 'Selecione um membro'),
  amount: z.number().positive('O valor deve ser maior que zero'),
  paymentDate: z.string().min(1, 'Informe a data do pagamento'),
  paymentMethod: z.string().min(1, 'Selecione a forma de pagamento'),
  notes: z.string().optional(),
  allocations: z.array(paymentAllocationSchema)
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
