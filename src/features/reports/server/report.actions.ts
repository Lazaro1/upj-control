'use server';

import { prisma } from '@/lib/db';
import { requireStaffAuth } from '@/lib/auth/roles.server';
import {
  calcDaysOverdue,
  getOverdueOpenAmount,
  getTodayInOrgTimezone,
  OVERDUE_CHARGE_STATUSES,
  parseIsoDateStart,
  roundMoney
} from '@/lib/delinquency';
import { Prisma } from '@prisma/client';

function buildDateFilter(
  dateFrom?: string,
  dateTo?: string
): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) {
    return undefined;
  }

  const dateFilter: Prisma.DateTimeFilter = {};

  if (dateFrom) {
    dateFilter.gte = new Date(dateFrom);
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  return dateFilter;
}

async function assertReportAccess() {
  return requireStaffAuth();
}

export async function getIncomeReport(dateFrom?: string, dateTo?: string) {
  try {
    await assertReportAccess();

    const paymentDateFilter = buildDateFilter(dateFrom, dateTo);
    const transactionDateFilter = buildDateFilter(dateFrom, dateTo);

    const [payments, cashEntriesRaw] = await Promise.all([
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: paymentDateFilter
          ? { paymentDate: paymentDateFilter }
          : undefined,
        _sum: { amount: true }
      }),
      prisma.cashTransaction.groupBy({
        by: ['category'],
        where: {
          type: 'entrada',
          ...(transactionDateFilter
            ? {
                transactionDate: transactionDateFilter
              }
            : {})
        },
        _sum: { amount: true }
      })
    ]);

    const paymentEntries = payments.map((item) => ({
      source: item.paymentMethod || 'Não informado',
      total: Number(item._sum.amount || 0)
    }));

    const cashEntries = cashEntriesRaw.map((item) => ({
      source: item.category,
      total: Number(item._sum.amount || 0)
    }));

    const paymentTotal = paymentEntries.reduce(
      (acc, item) => acc + item.total,
      0
    );
    const cashTotal = cashEntries.reduce((acc, item) => acc + item.total, 0);

    return {
      success: true,
      data: {
        paymentEntries,
        cashEntries,
        grandTotal: paymentTotal + cashTotal
      }
    };
  } catch (error: any) {
    console.error('Error fetching income report:', error);
    return { success: false, error: error.message };
  }
}

export async function getExpenseReport(dateFrom?: string, dateTo?: string) {
  try {
    await assertReportAccess();

    const transactionDateFilter = buildDateFilter(dateFrom, dateTo);

    const expensesRaw = await prisma.cashTransaction.groupBy({
      by: ['category'],
      where: {
        type: 'saida',
        ...(transactionDateFilter
          ? {
              transactionDate: transactionDateFilter
            }
          : {})
      },
      _sum: { amount: true }
    });

    const expenses = expensesRaw.map((item) => ({
      category: item.category,
      total: Number(item._sum.amount || 0)
    }));

    const grandTotal = expenses.reduce((acc, item) => acc + item.total, 0);

    return {
      success: true,
      data: {
        expenses,
        grandTotal
      }
    };
  } catch (error: any) {
    console.error('Error fetching expense report:', error);
    return { success: false, error: error.message };
  }
}

export async function getConsolidatedBalance(
  dateFrom?: string,
  dateTo?: string
) {
  try {
    await assertReportAccess();

    const paymentDateFilter = buildDateFilter(dateFrom, dateTo);
    const transactionDateFilter = buildDateFilter(dateFrom, dateTo);

    const [paymentTotalResult, cashEntriesResult, cashExpensesResult] =
      await Promise.all([
        prisma.payment.aggregate({
          where: paymentDateFilter
            ? { paymentDate: paymentDateFilter }
            : undefined,
          _sum: { amount: true }
        }),
        prisma.cashTransaction.aggregate({
          where: {
            type: 'entrada',
            ...(transactionDateFilter
              ? {
                  transactionDate: transactionDateFilter
                }
              : {})
          },
          _sum: { amount: true }
        }),
        prisma.cashTransaction.aggregate({
          where: {
            type: 'saida',
            ...(transactionDateFilter
              ? {
                  transactionDate: transactionDateFilter
                }
              : {})
          },
          _sum: { amount: true }
        })
      ]);

    const totalPayments = Number(paymentTotalResult._sum.amount || 0);
    const totalCashEntries = Number(cashEntriesResult._sum.amount || 0);
    const totalCashExpenses = Number(cashExpensesResult._sum.amount || 0);

    const totalEntradas = totalPayments + totalCashEntries;
    const totalSaidas = totalCashExpenses;
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
    console.error('Error fetching consolidated balance:', error);
    return { success: false, error: error.message };
  }
}

export async function getReceiptsByChargeType(
  dateFrom?: string,
  dateTo?: string
) {
  try {
    await assertReportAccess();

    const paymentDateFilter = buildDateFilter(dateFrom, dateTo);

    const allocations = await prisma.paymentAllocation.findMany({
      where: paymentDateFilter
        ? {
            payment: {
              paymentDate: paymentDateFilter
            }
          }
        : undefined,
      include: {
        payment: true,
        charge: {
          include: {
            chargeType: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const grouped = allocations.reduce(
      (acc, allocation) => {
        const chargeTypeName = allocation.charge.chargeType.name;
        const amount = Number(allocation.allocatedAmount || 0);

        if (!acc[chargeTypeName]) {
          acc[chargeTypeName] = {
            chargeTypeName,
            total: 0,
            count: 0
          };
        }

        acc[chargeTypeName].total += amount;
        acc[chargeTypeName].count += 1;

        return acc;
      },
      {} as Record<
        string,
        { chargeTypeName: string; total: number; count: number }
      >
    );

    return {
      success: true,
      data: Object.values(grouped)
    };
  } catch (error: any) {
    console.error('Error fetching receipts by charge type:', error);
    return { success: false, error: error.message };
  }
}

export async function getMemberFinancialPosition(
  dateFrom?: string,
  dateTo?: string
) {
  try {
    await assertReportAccess();

    const competenceDateFilter = buildDateFilter(dateFrom, dateTo);
    const paymentDateFilter = buildDateFilter(dateFrom, dateTo);

    const members = await prisma.member.findMany({
      where: {
        status: 'ativo'
      },
      select: {
        id: true,
        fullName: true,
        charges: {
          where: competenceDateFilter
            ? {
                competenceDate: competenceDateFilter
              }
            : undefined,
          select: {
            amount: true,
            status: true
          }
        },
        payments: {
          where: paymentDateFilter
            ? {
                paymentDate: paymentDateFilter
              }
            : undefined,
          select: {
            amount: true
          }
        }
      }
    });

    const data = members
      .map((member) => {
        const totalCharged = member.charges
          .filter((charge) => charge.status !== 'cancelada')
          .reduce((acc, charge) => acc + Number(charge.amount || 0), 0);

        const totalPaid = member.payments.reduce(
          (acc, payment) => acc + Number(payment.amount || 0),
          0
        );

        return {
          memberId: member.id,
          memberName: member.fullName,
          totalCharged,
          totalPaid,
          balance: totalCharged - totalPaid
        };
      })
      .sort((a, b) => b.balance - a.balance);

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error fetching member financial position:', error);
    return { success: false, error: error.message };
  }
}

export interface DelinquencyReportFilters {
  dueDateFrom?: string;
  dueDateTo?: string;
  chargeTypeId?: string;
}

export interface DelinquencySummaryRow {
  memberId: string;
  memberName: string;
  overdueCount: number;
  totalOpenAmount: number;
  oldestDueDate: string;
}

export interface DelinquencyDetailRow {
  chargeId: string;
  memberId: string;
  memberName: string;
  chargeTypeId: string;
  chargeTypeName: string;
  dueDate: string;
  openAmount: number;
  daysOverdue: number;
}

export interface DelinquencyChargeTypeOption {
  id: string;
  name: string;
}

export interface DelinquencyReportData {
  summaries: DelinquencySummaryRow[];
  details: DelinquencyDetailRow[];
  chargeTypeOptions: DelinquencyChargeTypeOption[];
  totals: {
    members: number;
    overdueCharges: number;
    totalOpenAmount: number;
  };
  appliedFilters: {
    dueDateFrom?: string;
    dueDateTo?: string;
    chargeTypeId?: string;
  };
}

function parseIsoDateEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

async function assertDelinquencyAccess() {
  return requireStaffAuth();
}

export async function getDelinquencyChargeTypeOptions() {
  try {
    await assertDelinquencyAccess();

    const chargeTypes = await prisma.chargeType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true
      }
    });

    return {
      success: true,
      data: chargeTypes
    };
  } catch (error: any) {
    console.error('Error fetching delinquency charge type options:', error);
    return { success: false, error: error.message };
  }
}

export async function getDelinquencyReport(
  filters: DelinquencyReportFilters = {}
) {
  try {
    await assertDelinquencyAccess();

    if (filters.dueDateFrom && filters.dueDateTo) {
      if (
        parseIsoDateStart(filters.dueDateFrom) >
        parseIsoDateEnd(filters.dueDateTo)
      ) {
        throw new Error('Periodo de vencimento invalido');
      }
    }

    const todayRef = getTodayInOrgTimezone();

    const dueDateFilter: Prisma.DateTimeFilter = {
      lt: todayRef
    };

    if (filters.dueDateFrom) {
      dueDateFilter.gte = parseIsoDateStart(filters.dueDateFrom);
    }

    if (filters.dueDateTo) {
      dueDateFilter.lte = parseIsoDateEnd(filters.dueDateTo);
    }

    const [charges, chargeTypeOptions] = await Promise.all([
      prisma.charge.findMany({
        where: {
          status: { in: [...OVERDUE_CHARGE_STATUSES] },
          dueDate: dueDateFilter,
          ...(filters.chargeTypeId
            ? {
                chargeTypeId: filters.chargeTypeId
              }
            : {})
        },
        select: {
          id: true,
          memberId: true,
          dueDate: true,
          amount: true,
          paymentAllocations: {
            select: { allocatedAmount: true }
          },
          member: {
            select: {
              fullName: true
            }
          },
          chargeType: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }]
      }),
      prisma.chargeType.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true
        }
      })
    ]);

    const details: DelinquencyDetailRow[] = charges
      .map((charge) => {
        const openAmount = getOverdueOpenAmount(charge);
        if (openAmount <= 0.01) return null;

        return {
          chargeId: charge.id,
          memberId: charge.memberId,
          memberName: charge.member.fullName,
          chargeTypeId: charge.chargeType.id,
          chargeTypeName: charge.chargeType.name,
          dueDate: charge.dueDate.toISOString(),
          openAmount,
          daysOverdue: calcDaysOverdue(charge.dueDate, todayRef)
        };
      })
      .filter((row): row is DelinquencyDetailRow => row !== null);

    const summariesMap = details.reduce(
      (acc, row) => {
        if (!acc[row.memberId]) {
          acc[row.memberId] = {
            memberId: row.memberId,
            memberName: row.memberName,
            overdueCount: 0,
            totalOpenAmount: 0,
            oldestDueDate: row.dueDate
          };
        }

        acc[row.memberId].overdueCount += 1;
        acc[row.memberId].totalOpenAmount = roundMoney(
          acc[row.memberId].totalOpenAmount + row.openAmount
        );

        if (new Date(row.dueDate) < new Date(acc[row.memberId].oldestDueDate)) {
          acc[row.memberId].oldestDueDate = row.dueDate;
        }

        return acc;
      },
      {} as Record<string, DelinquencySummaryRow>
    );

    const summaries = Object.values(summariesMap).sort((a, b) => {
      if (b.overdueCount !== a.overdueCount) {
        return b.overdueCount - a.overdueCount;
      }

      return b.totalOpenAmount - a.totalOpenAmount;
    });

    const totalOpenAmount = roundMoney(
      summaries.reduce((acc, row) => acc + row.totalOpenAmount, 0)
    );

    const data: DelinquencyReportData = {
      summaries,
      details,
      chargeTypeOptions,
      totals: {
        members: summaries.length,
        overdueCharges: details.length,
        totalOpenAmount
      },
      appliedFilters: {
        dueDateFrom: filters.dueDateFrom,
        dueDateTo: filters.dueDateTo,
        chargeTypeId: filters.chargeTypeId
      }
    };

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error fetching delinquency report:', error);
    return { success: false, error: error.message };
  }
}
