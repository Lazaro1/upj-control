import { z } from 'zod';

export const memberFormSchema = z.object({
  fullName: z
    .string({ message: 'Nome completo é obrigatório' })
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cim: z.string().optional(),
  email: z
    .string({ message: 'E-mail é obrigatório' })
    .email('E-mail inválido'),
  phone: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'licenciado', 'remido'], {
    message: 'Status é obrigatório'
  }),
  joinedAt: z.string().optional(),
  notesInternal: z.string().optional()
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
