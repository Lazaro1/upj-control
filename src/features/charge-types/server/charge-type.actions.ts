'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { chargeTypeSchema, type ChargeTypeFormValues } from '../schemas/charge-type.schema';

export async function getChargeTypes({
  page = 1,
  perPage = 10,
  search,
  active
}: {
  page?: number;
  perPage?: number;
  search?: string;
  active?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (active !== undefined) {
    where.active = active;
  }

  const [chargeTypes, total] = await Promise.all([
    prisma.chargeType.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.chargeType.count({ where })
  ]);

  return {
    chargeTypes: chargeTypes.map((c) => ({
      ...c,
      defaultAmount: c.defaultAmount ? c.defaultAmount.toNumber() : null
    })),
    total,
    pageCount: Math.ceil(total / perPage)
  };
}

export async function getChargeTypeById(id: string) {
  const chargeType = await prisma.chargeType.findUnique({ where: { id } });
  if (!chargeType) return null;

  return {
    ...chargeType,
    defaultAmount: chargeType.defaultAmount ? chargeType.defaultAmount.toNumber() : null
  };
}

export async function createChargeType(data: ChargeTypeFormValues) {
  const parsed = chargeTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const chargeType = await prisma.chargeType.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      defaultAmount: parsed.data.defaultAmount ?? null,
      isRecurring: parsed.data.isRecurring,
      active: parsed.data.active
    }
  });

  revalidatePath('/dashboard/charge-types');
  return { success: true, data: chargeType };
}

export async function updateChargeType(id: string, data: ChargeTypeFormValues) {
  const parsed = chargeTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const chargeType = await prisma.chargeType.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      defaultAmount: parsed.data.defaultAmount ?? null,
      isRecurring: parsed.data.isRecurring,
      active: parsed.data.active
    }
  });

  revalidatePath('/dashboard/charge-types');
  return { success: true, data: chargeType };
}

export async function deleteChargeType(id: string) {
  await prisma.chargeType.update({
    where: { id },
    data: { active: false }
  });

  revalidatePath('/dashboard/charge-types');
  return { success: true };
}
