'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

export async function logPeriodClosed(params: {
  periodClosingId: string;
  competenceMonth: number;
  competenceYear: number;
  totalCharged: number;
  totalReceived: number;
  balance: number;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: 'Nao autorizado' };
  }

  await writeAuditLog(prisma, {
    orgId,
    actorUserId: userId,
    action: 'period.closed',
    entityType: 'period',
    entityId: params.periodClosingId,
    newDataJson: {
      competenceMonth: params.competenceMonth,
      competenceYear: params.competenceYear,
      totalCharged: params.totalCharged,
      totalReceived: params.totalReceived,
      balance: params.balance
    }
  });

  return { success: true };
}
