'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

export async function getRecurringChargeTypes() {
  const types = await prisma.chargeType.findMany({
    where: { isRecurring: true, active: true },
    include: { recurringChargeRules: { where: { active: true } } }
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    defaultAmount: t.defaultAmount?.toNumber() || 0,
    rule: t.recurringChargeRules[0]
      ? {
          id: t.recurringChargeRules[0].id,
          frequency: t.recurringChargeRules[0].frequency,
          amount: t.recurringChargeRules[0].amount.toNumber()
        }
      : null
  }));
}

export async function getProcessingPreview(chargeTypeId: string) {
  const recurringChargeType = await prisma.chargeType.findFirst({
    where: {
      id: chargeTypeId,
      isRecurring: true,
      active: true,
      recurringChargeRules: {
        some: {
          active: true
        }
      }
    },
    select: { id: true }
  });

  if (!recurringChargeType) {
    throw new Error('Tipo de cobrança recorrente inválido ou inativo.');
  }

  const activeMembers = await prisma.member.count({
    where: { status: 'ativo' }
  });

  return {
    memberCount: activeMembers
  };
}

export async function processBulkCharges(data: {
  chargeTypeId: string;
  competenceMonth: number;
  competenceYear: number;
  dueDate: Date;
  description?: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: 'Não autorizado.' };
  }

  // 1. Validar se o período não está fechado (PeriodClosing no futuro)
  const isClosed = await prisma.periodClosing.findUnique({
    where: {
      competenceMonth_competenceYear: {
        competenceMonth: data.competenceMonth,
        competenceYear: data.competenceYear
      }
    }
  });

  if (isClosed) {
    return {
      success: false,
      error: 'Este período já foi encerrado e não permite novos lançamentos.'
    };
  }

  // 2. Buscar a regra
  const chargeType = await prisma.chargeType.findUnique({
    where: { id: data.chargeTypeId },
    include: { recurringChargeRules: { where: { active: true } } }
  });

  if (!chargeType || !chargeType.recurringChargeRules[0]) {
    return { success: false, error: 'Regra de recorrência não encontrada.' };
  }

  const rule = chargeType.recurringChargeRules[0];
  const amount = rule.amount;

  // 3. Buscar membros ativos
  const members = await prisma.member.findMany({
    where: { status: 'ativo' },
    select: { id: true }
  });

  const competenceDate = new Date(
    data.competenceYear,
    data.competenceMonth - 1,
    1
  );

  let createdCount = 0;
  let skippedCount = 0;

  // 4. Processar em batch
  for (const member of members) {
    // Verificar duplicidade
    const existing = await prisma.charge.findFirst({
      where: {
        memberId: member.id,
        chargeTypeId: data.chargeTypeId,
        competenceDate: competenceDate
      }
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    await prisma.charge.create({
      data: {
        memberId: member.id,
        chargeTypeId: data.chargeTypeId,
        amount: amount,
        competenceDate: competenceDate,
        dueDate: data.dueDate,
        description:
          data.description ||
          `${chargeType.name} - ${format(competenceDate, 'MM/yyyy')}`,
        status: 'pendente',
        createdBy: userId
      }
    });
    createdCount++;
  }

  revalidatePath('/dashboard/charges');

  await writeAuditLog(prisma, {
    orgId,
    actorUserId: userId,
    action: 'charge.recurring_bulk_processed',
    entityType: 'recurring_charge_batch',
    entityId: `${data.chargeTypeId}:${format(competenceDate, 'yyyy-MM')}`,
    newDataJson: {
      chargeTypeId: data.chargeTypeId,
      competenceMonth: data.competenceMonth,
      competenceYear: data.competenceYear,
      dueDate: data.dueDate.toISOString(),
      createdCount,
      skippedCount,
      totalProcessed: members.length
    }
  });

  return {
    success: true,
    data: {
      createdCount,
      skippedCount,
      totalProcessed: members.length
    }
  };
}
