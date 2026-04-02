'use server';

import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  type ChargeFormValues,
  chargeFormSchema
} from '../schemas/charge.schema';
import { ChargeStatus, Prisma } from '@prisma/client';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

export async function getCharges(
  page = 1,
  perPage = 10,
  search?: string,
  status?: string,
  memberId?: string,
  chargeTypeId?: string,
  dueDate?: string // YYYY-MM-DD format
) {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error('Organização não encontrada'); // Isolamento multitenant no futuro

    const where: Prisma.ChargeWhereInput = {};

    if (search) {
      // Search by description or member name
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { member: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      const parsedStatuses = status
        .split(',')
        .map((value) => value.trim())
        .filter((value): value is ChargeStatus =>
          Object.values(ChargeStatus).includes(value as ChargeStatus)
        );

      if (parsedStatuses.length === 1) {
        where.status = parsedStatuses[0];
      } else if (parsedStatuses.length > 1) {
        where.status = { in: parsedStatuses };
      }
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (chargeTypeId) {
      where.chargeTypeId = chargeTypeId;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        equals: date
      };
    }

    const [charges, total] = await Promise.all([
      prisma.charge.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { dueDate: 'desc' },
        include: {
          member: true,
          chargeType: true
        }
      }),
      prisma.charge.count({ where })
    ]);

    // Parse the data into a serializable interface
    const formattedCharges = charges.map((charge) => ({
      id: charge.id,
      memberId: charge.memberId,
      chargeTypeId: charge.chargeTypeId,
      member: {
        id: charge.member.id,
        fullName: charge.member.fullName,
        email: charge.member.email
      },
      chargeType: {
        id: charge.chargeType.id,
        name: charge.chargeType.name
      },
      competenceDate: charge.competenceDate.toISOString(),
      dueDate: charge.dueDate.toISOString(),
      description: charge.description,
      amount: Number(charge.amount),
      status: charge.status,
      createdAt: charge.createdAt.toISOString()
    }));

    return {
      success: true,
      data: formattedCharges,
      total,
      pageCount: Math.ceil(total / perPage)
    };
  } catch (error: any) {
    console.error('Error fetching charges:', error);
    return { success: false, error: error.message };
  }
}

export async function getChargeById(id: string) {
  try {
    const charge = await prisma.charge.findUnique({
      where: { id },
      select: {
        id: true,
        memberId: true,
        chargeTypeId: true,
        competenceDate: true,
        dueDate: true,
        description: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!charge) return { success: false, error: 'Cobrança não encontrada' };

    return {
      success: true,
      data: {
        id: charge.id,
        memberId: charge.memberId,
        chargeTypeId: charge.chargeTypeId,
        description: charge.description,
        status: charge.status,
        amount: Number(charge.amount),
        competenceDate: charge.competenceDate.toISOString(),
        dueDate: charge.dueDate.toISOString(),
        createdAt: charge.createdAt.toISOString(),
        updatedAt: charge.updatedAt.toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCharge(data: ChargeFormValues) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error('Não autorizado');

    const validatedData = chargeFormSchema.parse(data);

    const charge = await prisma.charge.create({
      data: {
        memberId: validatedData.memberId,
        chargeTypeId: validatedData.chargeTypeId,
        competenceDate: new Date(validatedData.competenceDate),
        dueDate: new Date(validatedData.dueDate),
        description: validatedData.description,
        amount: validatedData.amount,
        status: validatedData.status as any,
        createdBy: userId
      }
    });

    // Auditoria
    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'charge.created',
      entityType: 'charge',
      entityId: charge.id,
      newDataJson: JSON.parse(JSON.stringify(charge))
    });

    revalidatePath('/dashboard/charges');
    return { success: true, data: charge };
  } catch (error: any) {
    console.error('Error creating charge:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCharge(
  id: string,
  data: Partial<ChargeFormValues>
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error('Não autorizado');

    // First fetch the old state
    const oldCharge = await prisma.charge.findUnique({ where: { id } });
    if (!oldCharge) throw new Error('Cobrança não encontrada');

    if (
      oldCharge.status !== 'pendente' &&
      data.amount &&
      data.amount !== Number(oldCharge.amount)
    ) {
      throw new Error(
        'Não é possível alterar o valor de uma cobrança após iniciados os pagamentos.'
      );
    }

    const payload: any = { ...data };

    // Transform dates properly
    if (data.competenceDate)
      payload.competenceDate = new Date(data.competenceDate);
    if (data.dueDate) payload.dueDate = new Date(data.dueDate);

    const updatedCharge = await prisma.charge.update({
      where: { id },
      data: payload
    });

    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'charge.updated',
      entityType: 'charge',
      entityId: id,
      oldDataJson: JSON.parse(JSON.stringify(oldCharge)),
      newDataJson: JSON.parse(JSON.stringify(updatedCharge))
    });

    revalidatePath('/dashboard/charges');
    return { success: true, data: updatedCharge };
  } catch (error: any) {
    console.error('Error updating charge:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelCharge(id: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new Error('Não autorizado');

    const oldCharge = await prisma.charge.findUnique({ where: { id } });
    if (!oldCharge) throw new Error('Cobrança não encontrada');

    if (oldCharge.status !== 'pendente') {
      throw new Error(
        'Apenas cobranças pendentes podem ser canceladas. Outras precisam ser estornadas ou perdoadas oficialmente.'
      );
    }

    const updatedCharge = await prisma.charge.update({
      where: { id },
      data: { status: 'cancelada' }
    });

    await writeAuditLog(prisma, {
      orgId,
      actorUserId: userId,
      action: 'charge.cancelled',
      entityType: 'charge',
      entityId: id,
      oldDataJson: JSON.parse(JSON.stringify(oldCharge)),
      newDataJson: JSON.parse(JSON.stringify(updatedCharge))
    });

    revalidatePath('/dashboard/charges');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
