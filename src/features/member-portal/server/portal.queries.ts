'use server';

import { prisma } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ChargeStatus } from '@prisma/client';

export async function getMemberByClerkId() {
  const { userId } = await auth();
  if (!userId) return null;

  // 1. First try to find by clerkUserId directly (fastest, most common case)
  let member = await prisma.member.findUnique({
    where: { clerkUserId: userId }
  });

  if (member) return member;

  // 2. If not found, it might be their first login. Fetch email from Clerk.
  const user = await currentUser();
  if (!user) return null;

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) return null;

  // 3. Find if a member exists with this email
  const memberByEmail = await prisma.member.findUnique({
    where: { email: primaryEmail }
  });

  // 4. If a member exists with that email, link the Clerk ID to them
  if (memberByEmail) {
    member = await prisma.member.update({
      where: { id: memberByEmail.id },
      data: { clerkUserId: userId }
    });
    return member;
  }

  // 5. If it reaches here, the user signed up but the Treasury hasn't added them as a member yet.
  return null;
}

export async function getPortalOverview() {
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
        chargeType: true
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

  const totalDue = charges.reduce(
    (acc, charge) => acc + charge.amount.toNumber(),
    0
  );

  const overdueCharges = charges.filter(
    (c) => new Date(c.dueDate) < new Date()
  );
  
  const upcomingCharges = charges.filter(
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
      overdueCharges: overdueCharges.map(c => ({
        ...c,
        amount: c.amount.toNumber(),
        chargeType: c.chargeType ? {
          ...c.chargeType,
          defaultAmount: c.chargeType.defaultAmount?.toNumber() ?? null
        } : null
      })),
      upcomingCharges: upcomingCharges.map(c => ({
        ...c,
        amount: c.amount.toNumber(),
        chargeType: c.chargeType ? {
          ...c.chargeType,
          defaultAmount: c.chargeType.defaultAmount?.toNumber() ?? null
        } : null
      })),
      lastPayments: lastPayments.map(p => ({
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
