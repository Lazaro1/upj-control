import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getChargeRemainingAmount } from '@/lib/charge-balance';

export async function getMemberByClerkId() {
  const { userId } = await auth();
  if (!userId) return null;

  // O vínculo agora é feito exclusivamente pela tela de verificação de CIM.
  // Se o clerkUserId não estiver vinculado, o layout do dashboard redireciona
  // para /auth/verify-cim antes de chegar aqui.
  const member = await prisma.member.findUnique({
    where: { clerkUserId: userId }
  });

  return member;
}

function mapPortalCharge(
  charge: Awaited<
    ReturnType<
      typeof prisma.charge.findMany<{
        include: { chargeType: true; paymentAllocations: true };
      }>
    >
  >[number]
) {
  const remainingAmount = getChargeRemainingAmount(charge);

  return {
    id: charge.id,
    dueDate: charge.dueDate,
    description: charge.description,
    amount: remainingAmount,
    originalAmount: Number(charge.amount),
    chargeType: charge.chargeType
      ? {
          ...charge.chargeType,
          defaultAmount: charge.chargeType.defaultAmount?.toNumber() ?? null
        }
      : null
  };
}

export async function getPortalOverview() {
  noStore();

  const member = await getMemberByClerkId();

  if (!member) {
    return {
      success: false,
      error: 'Membro não encontrado ou não vinculado a esta conta.'
    };
  }

  const [charges, lastPayments] = await Promise.all([
    // Busca todas as cobranças pendentes ou parcialmente pagas
    prisma.charge.findMany({
      where: {
        memberId: member.id,
        status: { in: ['pendente', 'parcialmente_paga'] }
      },
      include: {
        chargeType: true,
        paymentAllocations: true
      },
      orderBy: { dueDate: 'asc' }
    }),
    // Busca os últimos 5 pagamentos
    prisma.payment.findMany({
      where: { memberId: member.id },
      orderBy: { paymentDate: 'desc' },
      take: 5
    })
  ]);

  const openCharges = charges
    .map(mapPortalCharge)
    .filter((charge) => charge.amount > 0.01);

  const totalDue = openCharges.reduce((acc, charge) => acc + charge.amount, 0);

  const overdueCharges = openCharges.filter(
    (c) => new Date(c.dueDate) < new Date()
  );

  const upcomingCharges = openCharges.filter(
    (c) => new Date(c.dueDate) >= new Date()
  );

  return {
    success: true,
    data: {
      memberId: member.id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      creditBalance: member.creditBalance.toNumber(),
      totalDue,
      overdueChargesCount: overdueCharges.length,
      overdueCharges,
      upcomingCharges,
      lastPayments: lastPayments.map((p) => ({
        ...p,
        amount: p.amount.toNumber()
      }))
    }
  };
}

export async function getPortalTransactions({
  page = 1,
  limit = 10
}: {
  page?: number;
  limit?: number;
}) {
  const member = await getMemberByClerkId();

  if (!member) {
    return { success: false, error: 'Membro não encontrado.' };
  }

  // Para o histórico completo, podemos trazer cobranças e exibir as liquidadas também
  const [charges, total] = await Promise.all([
    prisma.charge.findMany({
      where: { memberId: member.id },
      include: { 
        chargeType: true, 
        paymentAllocations: { 
          include: { payment: true } 
        } 
      },
      orderBy: { competenceDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.charge.count({ where: { memberId: member.id } })
  ]);

  return {
    success: true,
    data: {
      items: charges.map(c => ({
        ...c,
        amount: c.amount.toNumber(),
        chargeType: c.chargeType ? {
          ...c.chargeType,
          defaultAmount: c.chargeType.defaultAmount?.toNumber() ?? null
        } : null,
        paymentAllocations: c.paymentAllocations.map(a => ({
          ...a,
          allocatedAmount: a.allocatedAmount.toNumber(),
          payment: a.payment ? {
            ...a.payment,
            amount: a.payment.amount.toNumber()
          } : null
        }))
      })),
      total,
      pageCount: Math.ceil(total / limit)
    }
  };
}
