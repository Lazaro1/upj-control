'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { ORG_ROLES } from '@/lib/auth/roles';
import { requireFinancialWrite } from '@/lib/auth/roles.server';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';
import { revalidatePath } from 'next/cache';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PeriodClosingSummary {
  totalCharged: number;
  totalReceived: number;
  balance: number;
  totalCharges: number;
  totalPayments: number;
  totalCashIn: number;
  totalCashOut: number;
}

export interface PeriodClosingListItem {
  id: string;
  competenceMonth: number;
  competenceYear: number;
  closedBy: string | null;
  closedAt: string;
  totalCharged: number;
  totalReceived: number;
  balance: number;
  notes: string | null;
}

// ─── Resumo financeiro do período ────────────────────────────────────────────

export async function getPeriodSummary(
  month: number,
  year: number
): Promise<{ success: boolean; data?: PeriodClosingSummary; error?: string }> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Total cobrado no período (competenceDate)
    const chargesAgg = await prisma.charge.aggregate({
      where: {
        competenceDate: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Total recebido no período (paymentDate)
    const paymentsAgg = await prisma.payment.aggregate({
      where: {
        paymentDate: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Entradas de caixa no período
    const cashInAgg = await prisma.cashTransaction.aggregate({
      where: {
        type: 'entrada',
        transactionDate: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true }
    });

    // Saídas de caixa no período
    const cashOutAgg = await prisma.cashTransaction.aggregate({
      where: {
        type: 'saida',
        transactionDate: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true }
    });

    const totalCharged = Number(chargesAgg._sum.amount || 0);
    const totalReceived = Number(paymentsAgg._sum.amount || 0);
    const totalCashIn = Number(cashInAgg._sum.amount || 0);
    const totalCashOut = Number(cashOutAgg._sum.amount || 0);

    return {
      success: true,
      data: {
        totalCharged,
        totalReceived,
        balance: totalReceived - totalCharged,
        totalCharges: chargesAgg._count,
        totalPayments: paymentsAgg._count,
        totalCashIn,
        totalCashOut
      }
    };
  } catch (error: any) {
    console.error('Error fetching period summary:', error);
    return { success: false, error: error.message };
  }
}

// ─── Verificar status do período ─────────────────────────────────────────────

export async function getPeriodStatus(
  month: number,
  year: number
): Promise<{
  success: boolean;
  closed?: boolean;
  closingData?: PeriodClosingListItem;
  error?: string;
}> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const closing = await prisma.periodClosing.findUnique({
      where: {
        competenceMonth_competenceYear: {
          competenceMonth: month,
          competenceYear: year
        }
      }
    });

    if (!closing) {
      return { success: true, closed: false };
    }

    return {
      success: true,
      closed: true,
      closingData: {
        id: closing.id,
        competenceMonth: closing.competenceMonth,
        competenceYear: closing.competenceYear,
        closedBy: closing.closedBy,
        closedAt: closing.closedAt.toISOString(),
        totalCharged: Number(closing.totalCharged),
        totalReceived: Number(closing.totalReceived),
        balance: Number(closing.balance),
        notes: closing.notes
      }
    };
  } catch (error: any) {
    console.error('Error checking period status:', error);
    return { success: false, error: error.message };
  }
}

// ─── Fechar período ──────────────────────────────────────────────────────────

export async function closePeriod(data: {
  competenceMonth: number;
  competenceYear: number;
  notes?: string;
}): Promise<{
  success: boolean;
  data?: PeriodClosingListItem;
  error?: string;
}> {
  try {
    const { userId, orgId } = await requireFinancialWrite();

    // Verificar se já está fechado
    const existing = await prisma.periodClosing.findUnique({
      where: {
        competenceMonth_competenceYear: {
          competenceMonth: data.competenceMonth,
          competenceYear: data.competenceYear
        }
      }
    });

    if (existing) {
      return {
        success: false,
        error: `O período ${String(data.competenceMonth).padStart(2, '0')}/${data.competenceYear} já está encerrado.`
      };
    }

    // Calcular resumo financeiro
    const startDate = new Date(
      data.competenceYear,
      data.competenceMonth - 1,
      1
    );
    const endDate = new Date(data.competenceYear, data.competenceMonth, 1);

    const chargesAgg = await prisma.charge.aggregate({
      where: { competenceDate: { gte: startDate, lt: endDate } },
      _sum: { amount: true }
    });

    const paymentsAgg = await prisma.payment.aggregate({
      where: { paymentDate: { gte: startDate, lt: endDate } },
      _sum: { amount: true }
    });

    const totalCharged = Number(chargesAgg._sum.amount || 0);
    const totalReceived = Number(paymentsAgg._sum.amount || 0);
    const balance = totalReceived - totalCharged;

    // Criar registro de fechamento
    const periodClosing = await prisma.periodClosing.create({
      data: {
        competenceMonth: data.competenceMonth,
        competenceYear: data.competenceYear,
        closedBy: userId,
        totalCharged,
        totalReceived,
        balance,
        notes: data.notes || null
      }
    });

    // Auditoria
    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'period.closed',
      entityType: 'period',
      entityId: periodClosing.id,
      newDataJson: {
        competenceMonth: data.competenceMonth,
        competenceYear: data.competenceYear,
        totalCharged,
        totalReceived,
        balance,
        notes: data.notes || null
      }
    });

    revalidatePath('/dashboard/period-closing');
    revalidatePath('/dashboard/charges');
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/cash-transactions');

    return {
      success: true,
      data: {
        id: periodClosing.id,
        competenceMonth: periodClosing.competenceMonth,
        competenceYear: periodClosing.competenceYear,
        closedBy: periodClosing.closedBy,
        closedAt: periodClosing.closedAt.toISOString(),
        totalCharged: Number(periodClosing.totalCharged),
        totalReceived: Number(periodClosing.totalReceived),
        balance: Number(periodClosing.balance),
        notes: periodClosing.notes
      }
    };
  } catch (error: any) {
    console.error('Error closing period:', error);
    return { success: false, error: error.message };
  }
}

// ─── Reabrir período (admin apenas) ──────────────────────────────────────────

export async function reopenPeriod(data: {
  competenceMonth: number;
  competenceYear: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) return { success: false, error: 'Não autorizado' };
    if (orgRole !== ORG_ROLES.ADMIN)
      return {
        success: false,
        error: 'Apenas administradores podem reabrir períodos encerrados.'
      };

    const existing = await prisma.periodClosing.findUnique({
      where: {
        competenceMonth_competenceYear: {
          competenceMonth: data.competenceMonth,
          competenceYear: data.competenceYear
        }
      }
    });

    if (!existing) {
      return {
        success: false,
        error: `O período ${String(data.competenceMonth).padStart(2, '0')}/${data.competenceYear} não está encerrado.`
      };
    }

    // Registrar auditoria antes de remover
    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'period.reopened',
      entityType: 'period',
      entityId: existing.id,
      oldDataJson: {
        competenceMonth: existing.competenceMonth,
        competenceYear: existing.competenceYear,
        totalCharged: Number(existing.totalCharged),
        totalReceived: Number(existing.totalReceived),
        balance: Number(existing.balance)
      },
      newDataJson: { reopened: true, reopenedAt: new Date().toISOString() }
    });

    // Remover registro de fechamento
    await prisma.periodClosing.delete({
      where: { id: existing.id }
    });

    revalidatePath('/dashboard/period-closing');
    revalidatePath('/dashboard/charges');
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/cash-transactions');

    return { success: true };
  } catch (error: any) {
    console.error('Error reopening period:', error);
    return { success: false, error: error.message };
  }
}

// ─── Listar períodos encerrados ───────────────────────────────────────────────

export async function listPeriodClosings(
  page = 1,
  perPage = 10
): Promise<{
  success: boolean;
  data?: PeriodClosingListItem[];
  total?: number;
  pageCount?: number;
  error?: string;
}> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const [closings, total] = await Promise.all([
      prisma.periodClosing.findMany({
        orderBy: [{ competenceYear: 'desc' }, { competenceMonth: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage
      }),
      prisma.periodClosing.count()
    ]);

    const data: PeriodClosingListItem[] = closings.map((c) => ({
      id: c.id,
      competenceMonth: c.competenceMonth,
      competenceYear: c.competenceYear,
      closedBy: c.closedBy,
      closedAt: c.closedAt.toISOString(),
      totalCharged: Number(c.totalCharged),
      totalReceived: Number(c.totalReceived),
      balance: Number(c.balance),
      notes: c.notes
    }));

    return {
      success: true,
      data,
      total,
      pageCount: Math.ceil(total / perPage)
    };
  } catch (error: any) {
    console.error('Error listing period closings:', error);
    return { success: false, error: error.message };
  }
}

// ─── Log de período encerrado (mantido para compatibilidade) ─────────────────

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
