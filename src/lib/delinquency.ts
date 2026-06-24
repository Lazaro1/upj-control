import type { Prisma } from '@prisma/client';
import { getChargeRemainingAmount } from '@/lib/charge-balance';

export const OVERDUE_CHARGE_STATUSES = [
  'pendente',
  'parcialmente_paga'
] as const;

export type OverdueChargeStatus = (typeof OVERDUE_CHARGE_STATUSES)[number];

export function parseIsoDateStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function getTodayInOrgTimezone(): Date {
  const timeZone = process.env.ORG_TIMEZONE || 'America/Sao_Paulo';
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  return parseIsoDateStart(todayIso);
}

export function calcDaysOverdue(
  dueDate: Date,
  todayRef = getTodayInOrgTimezone()
): number {
  const dueUtc = Date.UTC(
    dueDate.getUTCFullYear(),
    dueDate.getUTCMonth(),
    dueDate.getUTCDate()
  );
  const todayUtc = Date.UTC(
    todayRef.getUTCFullYear(),
    todayRef.getUTCMonth(),
    todayRef.getUTCDate()
  );

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((todayUtc - dueUtc) / msPerDay));
}

export function formatDbDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  const day = String(value.getUTCDate()).padStart(2, '0');
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const year = value.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function buildOverdueDueDateFilter(
  todayRef = getTodayInOrgTimezone()
): Prisma.DateTimeFilter {
  return { lt: todayRef };
}

type ChargeWithAllocations = {
  amount: number | string | { toNumber(): number };
  paymentAllocations: {
    allocatedAmount: number | string | { toNumber(): number };
  }[];
};

export function getOverdueOpenAmount(charge: ChargeWithAllocations): number {
  return roundMoney(getChargeRemainingAmount(charge));
}

export function summarizeOverdueCharges(charges: ChargeWithAllocations[]): {
  totalOpenAmount: number;
  chargeCount: number;
} {
  let totalOpenAmount = 0;
  let chargeCount = 0;

  for (const charge of charges) {
    const openAmount = getOverdueOpenAmount(charge);
    if (openAmount <= 0.01) continue;
    totalOpenAmount = roundMoney(totalOpenAmount + openAmount);
    chargeCount += 1;
  }

  return { totalOpenAmount, chargeCount };
}

export const overdueChargeSelect = {
  amount: true,
  paymentAllocations: {
    select: { allocatedAmount: true }
  }
} as const;

export const overdueChargeWithCompetenceSelect = {
  ...overdueChargeSelect,
  competenceDate: true
} as const;
