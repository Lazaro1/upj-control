'use server';

import { prisma } from '@/lib/db';
import { MemberStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { memberFormSchema, type MemberFormValues } from '../schemas/member.schema';

export async function getMembers({
  page = 1,
  perPage = 10,
  fullName,
  email,
  phone,
  status
}: {
  page?: number;
  perPage?: number;
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

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' }
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
