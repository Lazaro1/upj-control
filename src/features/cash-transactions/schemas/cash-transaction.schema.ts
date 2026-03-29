import * as z from 'zod';

export const cashTransactionSchema = z.object({
  type: z.enum(['entrada', 'saida']),
  category: z.string().min(1, 'Informe a categoria'),
  description: z.string().optional(),
  amount: z.number().positive('O valor deve ser maior que zero'),
  transactionDate: z.string().min(1, 'Informe a data da transação'),
  relatedMemberId: z.string().optional(),
  relatedPaymentId: z.string().optional()
});

export type CashTransactionFormValues = z.infer<typeof cashTransactionSchema>;
