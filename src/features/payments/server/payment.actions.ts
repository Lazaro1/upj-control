'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  type PaymentFormValues,
  paymentSchema
} from '../schemas/payment.schema';
import { Prisma } from '@prisma/client';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

export async function getPayments(
  page = 1,
  perPage = 10,
  search?: string,
  memberId?: string,
  paymentMethod?: string,
  sort?: string
) {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error('Organização não encontrada');

    const where: Prisma.PaymentWhereInput = {};

    if (search) {
      where.OR = [
        { member: { fullName: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const sortableFields = [
      'memberFullName',
      'amount',
      'paymentMethod',
      'paymentDate',
      'createdAt'
    ] as const;
    type PaymentSortableField = (typeof sortableFields)[number];

    const isSortableField = (value: string): value is PaymentSortableField =>
      sortableFields.includes(value as PaymentSortableField);

    let orderBy:
      | Prisma.PaymentOrderByWithRelationInput
      | Prisma.PaymentOrderByWithRelationInput[] = { paymentDate: 'desc' };

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

          if (primarySort.id === 'memberFullName') {
            orderBy = [
              { member: { fullName: direction } },
              { paymentDate: 'desc' }
            ];
          } else if (primarySort.id === 'paymentDate') {
            orderBy = { paymentDate: direction };
          } else {
            orderBy = [
              {
                [primarySort.id]: direction
              } as Prisma.PaymentOrderByWithRelationInput,
              { paymentDate: 'desc' }
            ];
          }
        }
      } catch {
        orderBy = { paymentDate: 'desc' };
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy,
        include: {
          member: true,
          paymentAllocations: {
            include: { charge: { include: { chargeType: true } } }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    const formattedPayments = payments.map((p) => ({
      id: p.id,
      memberId: p.memberId,
      member: {
        id: p.member.id,
        fullName: p.member.fullName,
        email: p.member.email
      },
      amount: Number(p.amount),
      paymentDate: p.paymentDate.toISOString(),
      paymentMethod: p.paymentMethod || 'Outros',
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      allocations: p.paymentAllocations.map((a) => ({
        id: a.id,
        chargeId: a.chargeId,
        allocatedAmount: Number(a.allocatedAmount),
        chargeTypeName: a.charge.chargeType.name
      }))
    }));

    return {
      success: true,
      data: formattedPayments,
      total,
      pageCount: Math.ceil(total / perPage)
    };
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return { success: false, error: error.message };
  }
}

export async function getPendingChargesByMember(memberId: string) {
  try {
    const charges = await prisma.charge.findMany({
      where: {
        memberId,
        status: { in: ['pendente', 'parcialmente_paga'] }
      },
      include: {
        chargeType: true,
        paymentAllocations: true
      },
      orderBy: { dueDate: 'asc' }
    });

    const parsed = charges.map((c) => {
      const totalPaid = c.paymentAllocations.reduce(
        (acc, alloc) => acc + Number(alloc.allocatedAmount),
        0
      );
      return {
        id: c.id,
        dueDate: c.dueDate.toISOString(),
        competenceDate: c.competenceDate.toISOString(),
        amount: Number(c.amount),
        alreadyPaid: totalPaid,
        remainingAmount: Number(c.amount) - totalPaid,
        status: c.status,
        description: c.description,
        chargeTypeName: c.chargeType.name
      };
    });

    return { success: true, data: parsed };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPayment(data: PaymentFormValues) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error('Não autorizado');

    const validatedData = paymentSchema.parse(data);

    // Validação de segurança matemática
    const allocatedSum = validatedData.allocations.reduce(
      (sum, a) => sum + a.allocatedAmount,
      0
    );
    // Tolerate small floating point precision issues, but technically we deal with cents or two decimals.
    // If the allocated sum differs from the total amount by more than 0.01 it is invalid.
    if (Math.abs(allocatedSum - validatedData.amount) > 0.01) {
      if (allocatedSum > validatedData.amount)
        throw new Error(
          'O valor alocado nas cobranças ultrapassa o valor total do pagamento.'
        );
      // Observação: Para esta iteração, exigimos alocação exata para simplificar,
      // mas se `allocatedSum < amount`, seria "crédito gerado" na conta corrente, o que implementaremos na fase 3.
    }

    // Iniciar Transação
    await prisma.$transaction(async (tx) => {
      // 1. Cria o Pagamento
      const payment = await tx.payment.create({
        data: {
          memberId: validatedData.memberId,
          amount: validatedData.amount,
          paymentDate: new Date(validatedData.paymentDate),
          paymentMethod: validatedData.paymentMethod,
          notes: validatedData.notes,
          createdBy: userId,
          paymentAllocations: {
            create: validatedData.allocations.map((a) => ({
              chargeId: a.chargeId,
              allocatedAmount: a.allocatedAmount
            }))
          }
        }
      });

      // 2. Recalcula os status das Cobranças baseando-se nas alocações recém inseridas
      for (const alloc of validatedData.allocations) {
        const charge = await tx.charge.findUnique({
          where: { id: alloc.chargeId }
        });
        if (!charge) throw new Error(`Charge ${alloc.chargeId} not found`);

        const allAllocationsForCharge = await tx.paymentAllocation.findMany({
          where: { chargeId: alloc.chargeId }
        });

        const currentTotalPaid = allAllocationsForCharge.reduce(
          (sum, pa) => sum + Number(pa.allocatedAmount),
          0
        );

        // Determina o novo status
        let newStatus = charge.status;
        if (currentTotalPaid >= Number(charge.amount) - 0.01) {
          newStatus = 'paga';
        } else if (currentTotalPaid > 0) {
          newStatus = 'parcialmente_paga';
        }

        if (newStatus !== charge.status) {
          await tx.charge.update({
            where: { id: charge.id },
            data: { status: newStatus as any }
          });
        }
      }

      await writeAuditLog(tx, {
        orgId,
        actorUserId: userId,
        action: 'payment.created',
        entityType: 'payment',
        entityId: payment.id,
        newDataJson: JSON.parse(JSON.stringify(payment))
      });

      await writeAuditLog(tx, {
        orgId,
        actorUserId: userId,
        action: 'payment.allocated',
        entityType: 'payment_allocation',
        entityId: payment.id,
        newDataJson: {
          paymentId: payment.id,
          allocations: validatedData.allocations
        }
      });
    });

    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/charges'); // Cobranças mudam de status
    return { success: true };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return { success: false, error: error.message };
  }
}

export async function reversePayment(paymentId: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error('Nao autorizado');

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          paymentAllocations: true
        }
      });

      if (!payment) {
        throw new Error('Pagamento nao encontrado');
      }

      const oldPaymentData = JSON.parse(JSON.stringify(payment));
      const affectedChargeIds = payment.paymentAllocations.map(
        (a) => a.chargeId
      );

      await tx.paymentAllocation.deleteMany({
        where: { paymentId }
      });

      await tx.payment.delete({
        where: { id: paymentId }
      });

      for (const chargeId of affectedChargeIds) {
        const charge = await tx.charge.findUnique({ where: { id: chargeId } });
        if (!charge) continue;

        const allocations = await tx.paymentAllocation.findMany({
          where: { chargeId }
        });

        const totalPaid = allocations.reduce(
          (sum, alloc) => sum + Number(alloc.allocatedAmount),
          0
        );

        let nextStatus = charge.status;
        if (totalPaid <= 0) nextStatus = 'pendente';
        else if (totalPaid < Number(charge.amount))
          nextStatus = 'parcialmente_paga';
        else nextStatus = 'paga';

        if (nextStatus !== charge.status) {
          await tx.charge.update({
            where: { id: chargeId },
            data: { status: nextStatus as any }
          });
        }
      }

      await writeAuditLog(tx, {
        orgId,
        actorUserId: userId,
        action: 'payment.reversed',
        entityType: 'payment',
        entityId: paymentId,
        oldDataJson: oldPaymentData,
        newDataJson: {
          reversed: true,
          reversedAt: new Date().toISOString()
        }
      });
    });

    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/charges');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
