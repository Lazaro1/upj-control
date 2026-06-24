import { z } from 'zod';

export const auditLogFilterSchema = z
  .object({
    actorUserId: z.string().optional(),
    action: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20)
  })
  .refine(
    (data) => {
      if (!data.dateFrom || !data.dateTo) return true;
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    },
    {
      message: 'dateFrom deve ser menor ou igual a dateTo',
      path: ['dateFrom']
    }
  );

export type AuditLogFilters = z.infer<typeof auditLogFilterSchema>;
