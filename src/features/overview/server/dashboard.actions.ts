'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import {
  calcDaysOverdue,
  getOverdueOpenAmount,
  getTodayInOrgTimezone,
  OVERDUE_CHARGE_STATUSES,
  overdueChargeSelect,
  overdueChargeWithCompetenceSelect,
  roundMoney,
  summarizeOverdueCharges
} from '@/lib/delinquency';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type KPIVariationUnit = 'percent' | 'percentagePoints' | 'absolute';

export interface KPICard {
  label: string;
  value: number;
  formattedValue: string;
  variation: number | null; // vs. mês anterior, null se não houver dado
  variationUnit: KPIVariationUnit;
  variationLabel: string;
  trend: 'up' | 'down' | 'neutral';
  positiveIsGood: boolean;
  icon: string;
}

export interface DashboardKPIs {
  revenue: KPICard;
  charged: KPICard;
  overdue: KPICard;
  cashBalance: KPICard;
  complianceRate: KPICard;
  activeMembers: KPICard;
}

export interface MonthlyDataPoint {
  month: string; // 'MM/YYYY'
  revenue: number;
  charged: number;
}

export interface ChargeTypeRevenue {
  chargeTypeName: string;
  totalReceived: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  total: number;
}

export interface MonthlyOverduePoint {
  month: string;
  overdueAmount: number;
  overdueCount: number;
}

export interface TopOverdueItem {
  memberId: string;
  memberName: string;
  totalOverdue: number;
  overdueCount: number;
  oldestDueDate: string;
  daysOverdue: number;
}

export interface TopOverdueData {
  items: TopOverdueItem[];
  totals: {
    memberCount: number;
    chargeCount: number;
    totalOpenAmount: number;
  };
}

export interface RecentPaymentItem {
  paymentId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
}

export interface DashboardAlert {
  type: 'warning' | 'danger';
  title: string;
  description: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function calcVariation(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : null;
  return ((current - previous) / previous) * 100;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function getPreviousMonth(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

export async function getDashboardKPIs(
  month: number,
  year: number
): Promise<{ success: boolean; data?: DashboardKPIs; error?: string }> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const current = getMonthRange(month, year);
    const prev = getPreviousMonth(month, year);
    const prevRange = getMonthRange(prev.month, prev.year);
    const todayRef = getTodayInOrgTimezone();

    // ── Current month queries ──
    const [
      currentRevenue,
      currentCharged,
      currentOverdue,
      currentCashIn,
      currentCashOut,
      currentPaidCharges,
      currentTotalCharges,
      currentActiveMembers,
      newMembersThisMonth,
      prevRevenue,
      prevCharged,
      prevCashIn,
      prevCashOut,
      newMembersPrevMonth,
      prevPaidCharges,
      prevTotalCharges
    ] = await Promise.all([
      // Revenue (payments received this month)
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: current.start, lt: current.end }
        },
        _sum: { amount: true }
      }),
      // Charged (charges with competence this month)
      prisma.charge.aggregate({
        where: {
          competenceDate: { gte: current.start, lt: current.end }
        },
        _sum: { amount: true }
      }),
      // Overdue (open balance on past-due charges)
      prisma.charge.findMany({
        where: {
          status: { in: [...OVERDUE_CHARGE_STATUSES] },
          dueDate: { lt: todayRef }
        },
        select: overdueChargeSelect
      }),
      // Cash in
      prisma.cashTransaction.aggregate({
        where: {
          type: 'entrada',
          transactionDate: { gte: current.start, lt: current.end }
        },
        _sum: { amount: true }
      }),
      // Cash out
      prisma.cashTransaction.aggregate({
        where: {
          type: 'saida',
          transactionDate: { gte: current.start, lt: current.end }
        },
        _sum: { amount: true }
      }),
      // Paid charges this month (for compliance rate)
      prisma.charge.count({
        where: {
          competenceDate: { gte: current.start, lt: current.end },
          status: 'paga'
        }
      }),
      // Total charges this month
      prisma.charge.count({
        where: {
          competenceDate: { gte: current.start, lt: current.end }
        }
      }),
      // Active members
      prisma.member.count({ where: { status: 'ativo' } }),
      prisma.member.count({
        where: {
          joinedAt: { gte: current.start, lt: current.end }
        }
      }),

      // ── Previous month queries ──
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: prevRange.start, lt: prevRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.charge.aggregate({
        where: {
          competenceDate: { gte: prevRange.start, lt: prevRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.cashTransaction.aggregate({
        where: {
          type: 'entrada',
          transactionDate: { gte: prevRange.start, lt: prevRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.cashTransaction.aggregate({
        where: {
          type: 'saida',
          transactionDate: { gte: prevRange.start, lt: prevRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.member.count({
        where: {
          joinedAt: { gte: prevRange.start, lt: prevRange.end }
        }
      }),
      prisma.charge.count({
        where: {
          competenceDate: { gte: prevRange.start, lt: prevRange.end },
          status: 'paga'
        }
      }),
      prisma.charge.count({
        where: {
          competenceDate: { gte: prevRange.start, lt: prevRange.end }
        }
      })
    ]);

    // ── Calculate values ──
    const revenue = Number(currentRevenue._sum.amount || 0);
    const prevRevenueVal = Number(prevRevenue._sum.amount || 0);
    const charged = Number(currentCharged._sum.amount || 0);
    const prevChargedVal = Number(prevCharged._sum.amount || 0);
    const { totalOpenAmount: overdue, chargeCount: overdueCount } =
      summarizeOverdueCharges(currentOverdue);
    const cashIn = Number(currentCashIn._sum.amount || 0);
    const cashOut = Number(currentCashOut._sum.amount || 0);
    const prevCashInVal = Number(prevCashIn._sum.amount || 0);
    const prevCashOutVal = Number(prevCashOut._sum.amount || 0);
    const cashBalance = cashIn - cashOut;
    const prevCashBalance = prevCashInVal - prevCashOutVal;
    const activeMembers = currentActiveMembers;
    const newMembersThisMonthVal = newMembersThisMonth;
    const newMembersPrevMonthVal = newMembersPrevMonth;

    // Compliance rate
    const complianceRate =
      currentTotalCharges > 0
        ? (currentPaidCharges / currentTotalCharges) * 100
        : 100;
    const prevComplianceRate =
      prevTotalCharges > 0 ? (prevPaidCharges / prevTotalCharges) * 100 : 100;

    // ── Variation calculation ──
    const revenueVar = calcVariation(revenue, prevRevenueVal);
    const chargedVar = calcVariation(charged, prevChargedVal);
    const cashBalanceVar = calcVariation(cashBalance, prevCashBalance);
    const complianceVar = complianceRate - prevComplianceRate;
    const newMembersVar =
      newMembersPrevMonthVal > 0 || newMembersThisMonthVal > 0
        ? newMembersThisMonthVal - newMembersPrevMonthVal
        : null;

    const data: DashboardKPIs = {
      revenue: {
        label: 'Receita do Mês',
        value: revenue,
        formattedValue: formatCurrency(revenue),
        variation: revenueVar,
        variationUnit: 'percent',
        variationLabel:
          revenueVar !== null ? 'vs. mês anterior' : 'sem dados anteriores',
        trend:
          revenueVar !== null ? (revenueVar >= 0 ? 'up' : 'down') : 'neutral',
        positiveIsGood: true,
        icon: 'trendingUp'
      },
      charged: {
        label: 'Total Cobrado',
        value: charged,
        formattedValue: formatCurrency(charged),
        variation: chargedVar,
        variationUnit: 'percent',
        variationLabel:
          chargedVar !== null ? 'vs. mês anterior' : 'sem dados anteriores',
        trend:
          chargedVar !== null ? (chargedVar >= 0 ? 'up' : 'down') : 'neutral',
        positiveIsGood: true,
        icon: 'receipt'
      },
      overdue: {
        label: 'Total em Atraso',
        value: overdue,
        formattedValue: formatCurrency(overdue),
        variation: null,
        variationUnit: 'percent',
        variationLabel:
          overdueCount === 1
            ? '1 cobrança vencida pendente'
            : `${overdueCount} cobranças vencidas pendentes`,
        trend: 'neutral',
        positiveIsGood: false,
        icon: 'alertTriangle'
      },
      cashBalance: {
        label: 'Saldo do Período',
        value: cashBalance,
        formattedValue: formatCurrency(cashBalance),
        variation: cashBalanceVar,
        variationUnit: 'percent',
        variationLabel:
          cashBalanceVar !== null ? 'vs. mês anterior' : 'sem dados anteriores',
        trend:
          cashBalanceVar !== null
            ? cashBalanceVar >= 0
              ? 'up'
              : 'down'
            : cashBalance >= 0
              ? 'up'
              : 'down',
        positiveIsGood: true,
        icon: 'scale'
      },
      complianceRate: {
        label: 'Taxa de Adimplência',
        value: complianceRate,
        formattedValue: `${complianceRate.toFixed(1)}%`,
        variation: complianceVar,
        variationUnit: 'percentagePoints',
        variationLabel: 'vs. mês anterior',
        trend: complianceVar >= 0 ? 'up' : 'down',
        positiveIsGood: true,
        icon: 'check'
      },
      activeMembers: {
        label: 'Membros Ativos',
        value: activeMembers,
        formattedValue: String(activeMembers),
        variation: newMembersThisMonthVal > 0 ? newMembersThisMonthVal : null,
        variationUnit: 'absolute',
        variationLabel:
          newMembersThisMonthVal === 1
            ? '1 novo ingresso este mês'
            : newMembersThisMonthVal > 1
              ? 'novos ingressos este mês'
              : newMembersVar !== null && newMembersVar < 0
                ? 'menos ingressos que no mês anterior'
                : 'sem novos ingressos',
        trend:
          newMembersVar !== null
            ? newMembersVar >= 0
              ? 'up'
              : 'down'
            : 'neutral',
        positiveIsGood: true,
        icon: 'usersGroup'
      }
    };

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching dashboard KPIs:', error);
    return { success: false, error: error.message };
  }
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export async function getDashboardCharts(
  month: number,
  year: number
): Promise<{
  success: boolean;
  data?: {
    monthlyTrend: MonthlyDataPoint[];
    chargeTypeRevenue: ChargeTypeRevenue[];
    paymentMethodBreakdown: PaymentMethodBreakdown[];
    monthlyOverdue: MonthlyOverduePoint[];
  };
  error?: string;
}> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    // ── Monthly trend (last 12 months) ──
    const months: MonthlyDataPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const range = getMonthRange(m, y);

      const [rev, chg] = await Promise.all([
        prisma.payment.aggregate({
          where: { paymentDate: { gte: range.start, lt: range.end } },
          _sum: { amount: true }
        }),
        prisma.charge.aggregate({
          where: { competenceDate: { gte: range.start, lt: range.end } },
          _sum: { amount: true }
        })
      ]);

      months.push({
        month: `${String(m).padStart(2, '0')}/${y}`,
        revenue: Number(rev._sum.amount || 0),
        charged: Number(chg._sum.amount || 0)
      });
    }

    // ── Revenue by charge type (current month) ──
    const currentRange = getMonthRange(month, year);
    const chargeTypeRevenueRaw = await prisma.paymentAllocation.findMany({
      where: {
        payment: {
          paymentDate: { gte: currentRange.start, lt: currentRange.end }
        }
      },
      select: {
        allocatedAmount: true,
        charge: {
          select: {
            chargeType: {
              select: { name: true }
            }
          }
        }
      }
    });

    const chargeTypeMap = new Map<string, number>();
    for (const alloc of chargeTypeRevenueRaw) {
      const name = alloc.charge.chargeType.name;
      const current = chargeTypeMap.get(name) || 0;
      chargeTypeMap.set(name, current + Number(alloc.allocatedAmount));
    }

    const chargeTypeRevenue: ChargeTypeRevenue[] = Array.from(
      chargeTypeMap.entries()
    ).map(([name, total]) => ({ chargeTypeName: name, totalReceived: total }));

    // ── Payment method breakdown (current month) ──
    const paymentMethodRaw = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        paymentDate: { gte: currentRange.start, lt: currentRange.end }
      },
      _sum: { amount: true }
    });

    const paymentMethodBreakdown: PaymentMethodBreakdown[] =
      paymentMethodRaw.map((p) => ({
        method: p.paymentMethod || 'Não informado',
        total: Number(p._sum.amount || 0)
      }));

    // ── Monthly overdue trend (last 12 months) ──
    const todayRef = getTodayInOrgTimezone();
    const overdueChargesForChart = await prisma.charge.findMany({
      where: {
        status: { in: [...OVERDUE_CHARGE_STATUSES] },
        dueDate: { lt: todayRef }
      },
      select: overdueChargeWithCompetenceSelect
    });

    const overdueMonths: MonthlyOverduePoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const range = getMonthRange(m, y);

      const monthCharges = overdueChargesForChart.filter(
        (charge) =>
          charge.competenceDate >= range.start &&
          charge.competenceDate < range.end
      );
      const monthSummary = summarizeOverdueCharges(monthCharges);

      overdueMonths.push({
        month: `${String(m).padStart(2, '0')}/${y}`,
        overdueAmount: monthSummary.totalOpenAmount,
        overdueCount: monthSummary.chargeCount
      });
    }

    return {
      success: true,
      data: {
        monthlyTrend: months,
        chargeTypeRevenue,
        paymentMethodBreakdown,
        monthlyOverdue: overdueMonths
      }
    };
  } catch (error: any) {
    console.error('Error fetching dashboard charts:', error);
    return { success: false, error: error.message };
  }
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export async function getDashboardAlerts(
  month: number,
  year: number
): Promise<{ success: boolean; data?: DashboardAlert[]; error?: string }> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const alerts: DashboardAlert[] = [];

    // 1. Previous month not closed
    const prev = getPreviousMonth(month, year);
    const prevClosing = await prisma.periodClosing.findUnique({
      where: {
        competenceMonth_competenceYear: {
          competenceMonth: prev.month,
          competenceYear: prev.year
        }
      }
    });

    if (!prevClosing) {
      const monthNames = [
        '',
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
      ];
      alerts.push({
        type: 'warning',
        title: 'Período anterior não encerrado',
        description: `O mês de ${monthNames[prev.month]}/${prev.year} ainda não foi fechado. Encerra-o para garantir a integridade dos dados.`
      });
    }

    // 2. High delinquency rate (>30%)
    const currentRange = getMonthRange(month, year);
    const [totalCharges, paidCharges] = await Promise.all([
      prisma.charge.count({
        where: {
          competenceDate: { gte: currentRange.start, lt: currentRange.end }
        }
      }),
      prisma.charge.count({
        where: {
          competenceDate: { gte: currentRange.start, lt: currentRange.end },
          status: 'paga'
        }
      })
    ]);

    if (totalCharges > 0) {
      const delinquencyRate =
        ((totalCharges - paidCharges) / totalCharges) * 100;
      if (delinquencyRate > 30) {
        alerts.push({
          type: 'danger',
          title: 'Inadimplência alta',
          description: `A taxa de inadimplência está em ${delinquencyRate.toFixed(1)}% (acima de 30%). Considere intensificar as cobranças.`
        });
      }
    }

    // 3. Negative cash balance
    const [cashIn, cashOut] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: {
          type: 'entrada',
          transactionDate: { gte: currentRange.start, lt: currentRange.end }
        },
        _sum: { amount: true }
      }),
      prisma.cashTransaction.aggregate({
        where: {
          type: 'saida',
          transactionDate: { gte: currentRange.start, lt: currentRange.end }
        },
        _sum: { amount: true }
      })
    ]);

    const balance =
      Number(cashIn._sum.amount || 0) - Number(cashOut._sum.amount || 0);
    if (balance < 0) {
      alerts.push({
        type: 'danger',
        title: 'Saldo negativo no período',
        description: `O saldo do período está em ${formatCurrency(balance)}. Verifique as saídas e planeje ajustes.`
      });
    }

    return { success: true, data: alerts };
  } catch (error: any) {
    console.error('Error fetching dashboard alerts:', error);
    return { success: false, error: error.message };
  }
}

// ─── Top Overdue ─────────────────────────────────────────────────────────────

export async function getTopOverdue(
  limit = 10
): Promise<{ success: boolean; data?: TopOverdueData; error?: string }> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const todayRef = getTodayInOrgTimezone();

    const overdueCharges = await prisma.charge.findMany({
      where: {
        status: { in: [...OVERDUE_CHARGE_STATUSES] },
        dueDate: { lt: todayRef }
      },
      include: {
        member: {
          select: { id: true, fullName: true }
        },
        paymentAllocations: {
          select: { allocatedAmount: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const memberMap = new Map<
      string,
      {
        memberId: string;
        memberName: string;
        totalOverdue: number;
        overdueCount: number;
        oldestDueDate: Date;
      }
    >();

    let chargeCount = 0;
    let totalOpenAmount = 0;

    for (const charge of overdueCharges) {
      const openAmount = getOverdueOpenAmount(charge);
      if (openAmount <= 0.01) continue;

      chargeCount += 1;
      totalOpenAmount = roundMoney(totalOpenAmount + openAmount);

      const existing = memberMap.get(charge.member.id);
      if (existing) {
        existing.totalOverdue = roundMoney(existing.totalOverdue + openAmount);
        existing.overdueCount += 1;
        if (charge.dueDate < existing.oldestDueDate) {
          existing.oldestDueDate = charge.dueDate;
        }
      } else {
        memberMap.set(charge.member.id, {
          memberId: charge.member.id,
          memberName: charge.member.fullName,
          totalOverdue: openAmount,
          overdueCount: 1,
          oldestDueDate: charge.dueDate
        });
      }
    }

    const items: TopOverdueItem[] = Array.from(memberMap.values())
      .sort((a, b) => {
        if (b.totalOverdue !== a.totalOverdue) {
          return b.totalOverdue - a.totalOverdue;
        }
        return b.overdueCount - a.overdueCount;
      })
      .slice(0, limit)
      .map((item) => ({
        memberId: item.memberId,
        memberName: item.memberName,
        totalOverdue: item.totalOverdue,
        overdueCount: item.overdueCount,
        oldestDueDate: item.oldestDueDate.toISOString(),
        daysOverdue: calcDaysOverdue(item.oldestDueDate, todayRef)
      }));

    return {
      success: true,
      data: {
        items,
        totals: {
          memberCount: memberMap.size,
          chargeCount,
          totalOpenAmount
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching top overdue:', error);
    return { success: false, error: error.message };
  }
}

// ─── Recent Payments ─────────────────────────────────────────────────────────

export async function getRecentPayments(
  limit = 10
): Promise<{ success: boolean; data?: RecentPaymentItem[]; error?: string }> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: 'Não autorizado' };

    const payments = await prisma.payment.findMany({
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        member: {
          select: { fullName: true }
        }
      }
    });

    const data: RecentPaymentItem[] = payments.map((p) => ({
      paymentId: p.id,
      memberName: p.member.fullName,
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching recent payments:', error);
    return { success: false, error: error.message };
  }
}

// ─── Period Status (for badge) ───────────────────────────────────────────────

export async function getDashboardPeriodStatus(
  month: number,
  year: number
): Promise<{
  success: boolean;
  closed?: boolean;
  closedAt?: string;
  error?: string;
}> {
  try {
    const closing = await prisma.periodClosing.findUnique({
      where: {
        competenceMonth_competenceYear: {
          competenceMonth: month,
          competenceYear: year
        }
      }
    });

    return {
      success: true,
      closed: !!closing,
      closedAt: closing?.closedAt.toISOString()
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
