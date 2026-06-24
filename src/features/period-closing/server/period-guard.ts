import { prisma } from '@/lib/db';

/**
 * Verifica se um período (mês/ano) está fechado.
 * Retorna true se o período estiver encerrado, false caso contrário.
 */
export async function isPeriodClosed(
  month: number,
  year: number
): Promise<boolean> {
  const closing = await prisma.periodClosing.findUnique({
    where: {
      competenceMonth_competenceYear: {
        competenceMonth: month,
        competenceYear: year
      }
    }
  });
  return !!closing;
}

/**
 * Verifica se um período está fechado e lança erro se estiver.
 * Usado como guarda em server actions de cobrança, pagamento e caixa.
 */
export async function requireOpenPeriod(
  month: number,
  year: number
): Promise<void> {
  const closed = await isPeriodClosed(month, year);
  if (closed) {
    throw new Error(
      `O período ${String(month).padStart(2, '0')}/${year} já foi encerrado e não permite novas operações.`
    );
  }
}

/**
 * Extrai mês e ano de uma data (competência ou transação).
 */
export function extractMonthYear(date: Date): { month: number; year: number } {
  const d = new Date(date);
  return {
    month: d.getMonth() + 1,
    year: d.getFullYear()
  };
}