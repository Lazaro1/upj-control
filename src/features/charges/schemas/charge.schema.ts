import * as z from 'zod';

export const chargeFormSchema = z.object({
  memberId: z.string().min(1, 'Selecione um membro'),
  chargeTypeId: z.string().min(1, 'Selecione o tipo de cobrança'),
  competenceDate: z.string().min(1, 'Informe o mês de competência'), // Mapped to YYYY-MM-DD
  dueDate: z.string().min(1, 'Informe a data de vencimento'), // Mapped to YYYY-MM-DD
  description: z.string().optional(),
  amount: z.number().positive('O valor deve ser maior que zero'),
  status: z.enum([
    'pendente',
    'parcialmente_paga',
    'paga',
    'cancelada',
    'estornada'
  ])
});

export type ChargeFormValues = z.infer<typeof chargeFormSchema>;
