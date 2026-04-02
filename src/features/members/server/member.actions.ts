'use server';

import { prisma } from '@/lib/db';
import { MemberStatus, type Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {
  memberFormSchema,
  type MemberFormValues
} from '../schemas/member.schema';
import { auth } from '@clerk/nextjs/server';
import { writeAuditLog } from '@/features/audit-logs/server/audit-log-writer';

export async function getMembers({
  page = 1,
  perPage = 10,
  sort,
  fullName,
  email,
  phone,
  status
}: {
  page?: number;
  perPage?: number;
  sort?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
}) {
  const where: Record<string, unknown> = {};

  if (fullName) {
    where.fullName = { contains: fullName, mode: 'insensitive' };
  }
  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }
  if (phone) {
    where.phone = { contains: phone, mode: 'insensitive' };
  }

  if (status) {
    const statuses = status.split(',') as MemberStatus[];
    where.status = { in: statuses };
  }

  const sortableFields = [
    'fullName',
    'cim',
    'email',
    'phone',
    'status',
    'joinedAt',
    'createdAt'
  ] as const;
  type MemberSortableField = (typeof sortableFields)[number];

  const isMemberSortableField = (value: string): value is MemberSortableField =>
    sortableFields.includes(value as MemberSortableField);

  let orderBy:
    | Prisma.MemberOrderByWithRelationInput
    | Prisma.MemberOrderByWithRelationInput[] = { createdAt: 'desc' };

  if (sort) {
    try {
      const parsed = JSON.parse(sort);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid sort format');
      }

      const primarySort = (
        parsed as Array<{ id?: string; desc?: boolean }>
      ).find((item) => (item.id ? isMemberSortableField(item.id) : false));

      if (primarySort?.id && isMemberSortableField(primarySort.id)) {
        const direction: Prisma.SortOrder = primarySort.desc ? 'desc' : 'asc';
        orderBy =
          primarySort.id === 'createdAt'
            ? { createdAt: direction }
            : [
                {
                  [primarySort.id]: direction
                } as Prisma.MemberOrderByWithRelationInput,
                { createdAt: 'desc' }
              ];
      }
    } catch {
      orderBy = { createdAt: 'desc' };
    }
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy
    }),
    prisma.member.count({ where })
  ]);

  return {
    members: members.map((m) => ({
      ...m,
      creditBalance: m.creditBalance.toNumber()
    })),
    total,
    pageCount: Math.ceil(total / perPage)
  };
}

export async function getMemberById(id: string) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return null;

  return {
    ...member,
    creditBalance: member.creditBalance.toNumber()
  };
}

export async function createMember(data: MemberFormValues) {
  const parsed = memberFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const member = await prisma.member.create({
    data: {
      fullName: parsed.data.fullName,
      cim: parsed.data.cim || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      status: parsed.data.status as MemberStatus,
      joinedAt: parsed.data.joinedAt ? new Date(parsed.data.joinedAt) : null,
      notesInternal: parsed.data.notesInternal || null
    }
  });

  revalidatePath('/dashboard/members');
  return { success: true, data: member };
}

export async function updateMember(id: string, data: MemberFormValues) {
  const parsed = memberFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const member = await prisma.member.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      cim: parsed.data.cim || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      status: parsed.data.status as MemberStatus,
      joinedAt: parsed.data.joinedAt ? new Date(parsed.data.joinedAt) : null,
      notesInternal: parsed.data.notesInternal || null
    }
  });

  revalidatePath('/dashboard/members');
  return { success: true, data: member };
}

export async function deleteMember(id: string) {
  await prisma.member.update({
    where: { id },
    data: { status: 'inativo' }
  });

  revalidatePath('/dashboard/members');
  return { success: true };
}

export async function logRolePermissionChanged(params: {
  targetUserId: string;
  oldRole?: string;
  newRole: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: 'Nao autorizado' };
  }

  await writeAuditLog(prisma, {
    orgId,
    actorUserId: userId,
    action: 'role.permission_changed',
    entityType: 'role',
    entityId: params.targetUserId,
    oldDataJson: params.oldRole ? { role: params.oldRole } : undefined,
    newDataJson: { role: params.newRole }
  });

  return { success: true };
}
