'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  type CashTransactionFormValues,
  cashTransactionSchema
} from '../schemas/cash-transaction.schema';
import { Prisma } from '@prisma/client';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

function parseDateAtBoundary(value: string, boundary: 'start' | 'end'): Date {
  const [year, month, day] = value.split('-').map(Number);
  const hour = boundary === 'start' ? 0 : 23;
  const minute = boundary === 'start' ? 0 : 59;
  const second = boundary === 'start' ? 0 : 59;
  const millisecond = boundary === 'start' ? 0 : 999;

  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
  );
}

export async function getCashTransactions(
  page = 1,
  perPage = 10,
  search?: string,
  type?: string | string[],
  category?: string,
  dateFrom?: string,
  dateTo?: string,
  sort?: string
) {
  try {
    const { orgId, orgRole } = await auth();
    if (!orgId) throw new Error('Organização não encontrada');
    if (orgRole === 'org:member') throw new Error('Acesso negado');

    const where: Prisma.CashTransactionWhereInput = {};

    if (type && (!Array.isArray(type) || type.length > 0)) {
      if (Array.isArray(type)) {
        where.type = { in: type as any[] };
      } else {
        where.type = type as any;
      }
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) {
        where.transactionDate.gte = parseDateAtBoundary(dateFrom, 'start');
      }
      if (dateTo) {
        where.transactionDate.lte = parseDateAtBoundary(dateTo, 'end');
      }
    }

    const sortableFields = [
      'transactionDate',
      'type',
      'category',
      'description',
      'amount',
      'createdAt'
    ] as const;
    type CashSortableField = (typeof sortableFields)[number];

    const isSortableField = (value: string): value is CashSortableField =>
      sortableFields.includes(value as CashSortableField);

    let orderBy:
      | Prisma.CashTransactionOrderByWithRelationInput
      | Prisma.CashTransactionOrderByWithRelationInput[] = {
      transactionDate: 'desc'
    };

    if (sort) {
      try {
        const parsed = JSON.parse(sort);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid sort format');
        }

        const primarySort = (
          parsed as Array<{ id?: string; desc?: boolean }>
        ).find((item) => (item.id ? isSortableField(item.id) : false));

        if (primarySort?.id && isSortableField(primarySort.id)) {
          const direction: Prisma.SortOrder = primarySort.desc ? 'desc' : 'asc';
          orderBy =
            primarySort.id === 'transactionDate'
              ? { transactionDate: direction }
              : [
                  {
                    [primarySort.id]: direction
                  } as Prisma.CashTransactionOrderByWithRelationInput,
                  { transactionDate: 'desc' }
                ];
        }
      } catch {
        orderBy = { transactionDate: 'desc' };
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy,
        include: {
          relatedPayment: true
        }
      }),
      prisma.cashTransaction.count({ where })
    ]);

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: Number(tx.amount),
      transactionDate: tx.transactionDate.toISOString(),
      relatedMemberId: tx.relatedMemberId,
      relatedPaymentId: tx.relatedPaymentId,
      createdAt: tx.createdAt.toISOString()
    }));

    return {
      success: true,
      data: formattedTransactions,
      total,
      pageCount: Math.ceil(total / perPage)
    };
  } catch (error: any) {
    console.error('Error fetching cash transactions:', error);
    return { success: false, error: error.message };
  }
}

export async function createCashTransaction(data: CashTransactionFormValues) {
  try {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !orgId) throw new Error('Não autorizado');
    if (orgRole === 'org:member') throw new Error('Acesso negado');

    const validatedData = cashTransactionSchema.parse(data);

    const transaction = await prisma.cashTransaction.create({
      data: {
        type: validatedData.type as any,
        category: validatedData.category,
        description: validatedData.description,
        amount: validatedData.amount,
        transactionDate: new Date(validatedData.transactionDate),
        relatedMemberId: validatedData.relatedMemberId,
        relatedPaymentId: validatedData.relatedPaymentId,
        createdBy: userId
      }
    });

    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'cash_transaction.created',
      entityType: 'cash_transaction',
      entityId: transaction.id,
      newDataJson: JSON.parse(JSON.stringify(transaction))
    });

    revalidatePath('/dashboard/cash-transactions');
    return { success: true, data: transaction };
  } catch (error: any) {
    console.error('Error creating cash transaction:', error);
    return { success: false, error: error.message };
  }
}

export async function getCashSummary(dateFrom?: string, dateTo?: string) {
  try {
    const { orgId, orgRole } = await auth();
    if (!orgId) throw new Error('Organização não encontrada');
    if (orgRole === 'org:member') throw new Error('Acesso negado');

    const where: Prisma.CashTransactionWhereInput = {};

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) {
        where.transactionDate.gte = parseDateAtBoundary(dateFrom, 'start');
      }
      if (dateTo) {
        where.transactionDate.lte = parseDateAtBoundary(dateTo, 'end');
      }
    }

    const [entradas, saidas] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: { ...where, type: 'entrada' },
        _sum: { amount: true }
      }),
      prisma.cashTransaction.aggregate({
        where: { ...where, type: 'saida' },
        _sum: { amount: true }
      })
    ]);

    const totalEntradas = Number(entradas._sum.amount || 0);
    const totalSaidas = Number(saidas._sum.amount || 0);
    const saldo = totalEntradas - totalSaidas;

    return {
      success: true,
      data: {
        totalEntradas,
        totalSaidas,
        saldo
      }
    };
  } catch (error: any) {
    console.error('Error fetching cash summary:', error);
    return { success: false, error: error.message };
  }
}
