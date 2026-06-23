'use server';

import { prisma } from '@/lib/db';
import { getOpenChargesPendingTotal } from '@/lib/charge-balance';
import { assertMemberStatementAccess } from './statement-access';

export type StatementEntry = {
  id: string;
  date: string;
  description: string;
  type: 'charge' | 'payment';
  amount: number;
  status?: string;
  chargeTypeName?: string;
  paymentMethod?: string;
};

export async function getMemberStatement(memberId: string) {
  try {
    await assertMemberStatementAccess(memberId);

    const [member, charges, payments] = await Promise.all([
      prisma.member.findUnique({
        where: { id: memberId },
        select: { fullName: true, creditBalance: true }
      }),
      prisma.charge.findMany({
        where: { memberId },
        include: {
          chargeType: true,
          paymentAllocations: true
        },
        orderBy: { dueDate: 'desc' }
      }),
      prisma.payment.findMany({
        where: { memberId },
        orderBy: { paymentDate: 'desc' }
      })
    ]);

    if (!member) throw new Error('Membro não encontrado');

    const entries: StatementEntry[] = [];

    // Add charges to entries
    charges.forEach(c => {
      entries.push({
        id: c.id,
        date: c.competenceDate.toISOString(),
        description: c.description || c.chargeType.name,
        type: 'charge',
        amount: Number(c.amount),
        status: c.status,
        chargeTypeName: c.chargeType.name
      });
    });

    // Add payments to entries
    payments.forEach(p => {
      entries.push({
        id: p.id,
        date: p.paymentDate.toISOString(),
        description: p.notes || `Pagamento via ${p.paymentMethod || 'Outros'}`,
        type: 'payment',
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod || 'Outros'
      });
    });

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate Summary
    const totalCharged = charges.reduce((acc, c) => acc + Number(c.amount), 0);
    const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const pendingAmount = getOpenChargesPendingTotal(charges);

    return {
      success: true,
      data: {
        memberName: member.fullName,
        creditBalance: Number(member.creditBalance),
        totalCharged,
        totalPaid,
        pendingAmount,
        entries
      }
    };
  } catch (error: any) {
    console.error('Error fetching statement:', error);
    return { success: false, error: error.message };
  }
}
