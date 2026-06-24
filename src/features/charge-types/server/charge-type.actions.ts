'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { type Prisma } from '@prisma/client';
import {
  chargeTypeSchema,
  type ChargeTypeFormValues
} from '../schemas/charge-type.schema';

export async function getChargeTypes({
  page = 1,
  perPage = 10,
  sort,
  search,
  active
}: {
  page?: number;
  perPage?: number;
  sort?: string;
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

  const sortableFields = [
    'name',
    'description',
    'defaultAmount',
    'isRecurring',
    'active',
    'createdAt'
  ] as const;
  type ChargeTypeSortableField = (typeof sortableFields)[number];

  const isSortableField = (value: string): value is ChargeTypeSortableField =>
    sortableFields.includes(value as ChargeTypeSortableField);

  let orderBy:
    | Prisma.ChargeTypeOrderByWithRelationInput
    | Prisma.ChargeTypeOrderByWithRelationInput[] = { createdAt: 'desc' };

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
        const direction: 'asc' | 'desc' = primarySort.desc ? 'desc' : 'asc';
        orderBy =
          primarySort.id === 'createdAt'
            ? { createdAt: direction }
            : [
                {
                  [primarySort.id]: direction
                } as Prisma.ChargeTypeOrderByWithRelationInput,
                { createdAt: 'desc' }
              ];
      }
    } catch {
      orderBy = { createdAt: 'desc' };
    }
  }

  const [chargeTypes, total] = await Promise.all([
    prisma.chargeType.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy
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
  const chargeType = await prisma.chargeType.findUnique({
    where: { id },
    include: { recurringChargeRules: true }
  });
  if (!chargeType) return null;

  const rule = chargeType.recurringChargeRules?.[0];

  return {
    ...chargeType,
    defaultAmount: chargeType.defaultAmount
      ? chargeType.defaultAmount.toNumber()
      : null,
    // Adicionando dados da regra para o formulário
    frequency: rule?.frequency || 'monthly',
    recurringAmount: rule?.amount ? rule.amount.toNumber() : undefined
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
      active: parsed.data.active,
      // Se for recorrente, cria a regra básica
      ...(parsed.data.isRecurring && {
        recurringChargeRules: {
          create: {
            frequency: parsed.data.frequency || 'monthly',
            amount:
              parsed.data.recurringAmount ?? parsed.data.defaultAmount ?? 0,
            active: true
          }
        }
      })
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

  // Gerenciar a regra de recorrência
  if (parsed.data.isRecurring) {
    const existingRule = await prisma.recurringChargeRule.findFirst({
      where: { chargeTypeId: id }
    });

    if (existingRule) {
      await prisma.recurringChargeRule.update({
        where: { id: existingRule.id },
        data: {
          frequency: parsed.data.frequency || 'monthly',
          amount: parsed.data.recurringAmount ?? parsed.data.defaultAmount ?? 0,
          active: true
        }
      });
    } else {
      await prisma.recurringChargeRule.create({
        data: {
          chargeTypeId: id,
          frequency: parsed.data.frequency || 'monthly',
          amount: parsed.data.recurringAmount ?? parsed.data.defaultAmount ?? 0,
          active: true
        }
      });
    }
  } else {
    await prisma.recurringChargeRule.updateMany({
      where: { chargeTypeId: id, active: true },
      data: { active: false }
    });
  }

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
