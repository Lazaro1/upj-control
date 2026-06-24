import { Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

export interface WriteAuditLogInput {
  orgId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldDataJson?: Prisma.InputJsonValue;
  newDataJson?: Prisma.InputJsonValue;
}

export async function writeAuditLog(db: DbClient, input: WriteAuditLogInput) {
  let actorUserId = input.actorUserId ?? null;

  if (actorUserId) {
    const actorMember = await db.member.findUnique({
      where: { clerkUserId: actorUserId },
      select: { id: true }
    });

    if (!actorMember) {
      actorUserId = null;
    }
  }

  return db.auditLog.create({
    data: {
      orgId: input.orgId ?? null,
      actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldDataJson: input.oldDataJson,
      newDataJson: input.newDataJson
    }
  });
}
