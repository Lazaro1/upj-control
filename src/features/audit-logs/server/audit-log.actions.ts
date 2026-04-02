'use server';

import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  auditLogFilterSchema,
  type AuditLogFilters
} from '../schemas/audit-log-filter.schema';

async function assertAuditAccess() {
  const { orgId, orgRole } = await auth();
  const allowedRoles = new Set(['org:treasurer', 'org:manager', 'org:admin']);

  if (!orgId) throw new Error('Nao autorizado');
  if (!orgRole || !allowedRoles.has(orgRole)) throw new Error('Acesso negado');

  return { orgId, orgRole };
}

function parseDateStart(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function parseDateEnd(value: string): Date {
  return new Date(`${value}T23:59:59.999Z`);
}

export async function getAuditLogs(filtersInput: Partial<AuditLogFilters>) {
  try {
    const { orgId } = await assertAuditAccess();
    const filters = auditLogFilterSchema.parse(filtersInput);

    const where: Prisma.AuditLogWhereInput = {
      orgId
    };

    if (filters.actorUserId) where.actorUserId = filters.actorUserId;
    if (filters.action) where.action = filters.action;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom)
        where.createdAt.gte = parseDateStart(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = parseDateEnd(filters.dateTo);
    }

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, totalItems] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: filters.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          actorMember: {
            select: {
              fullName: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      success: true,
      data: {
        items,
        pagination: {
          page: filters.page,
          pageSize: filters.pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / filters.pageSize)
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAuditLogById(id: string) {
  try {
    const { orgId } = await assertAuditAccess();

    const item = await prisma.auditLog.findFirst({
      where: { id, orgId },
      include: {
        actorMember: {
          select: { fullName: true }
        }
      }
    });

    if (!item) {
      return { success: false, error: 'Log nao encontrado' };
    }

    return { success: true, data: item };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
