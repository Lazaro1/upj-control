import assert from 'node:assert/strict';
import test from 'node:test';
import { writeAuditLog } from './audit-log-writer';

test('keeps actorUserId when actor exists as a member', async () => {
  let actorUserIdWritten: string | null | undefined;

  const db = {
    member: {
      findUnique: async () => ({ id: 'member_1' })
    },
    auditLog: {
      create: async ({ data }: { data: { actorUserId?: string | null } }) => {
        actorUserIdWritten = data.actorUserId;
        return { id: 'audit_1' };
      }
    }
  };

  await writeAuditLog(db as any, {
    orgId: 'org_1',
    actorUserId: 'user_1',
    action: 'charge.created',
    entityType: 'charge',
    entityId: 'charge_1'
  });

  assert.equal(actorUserIdWritten, 'user_1');
});

test('stores null actorUserId when clerk user has no member record', async () => {
  let actorUserIdWritten: string | null | undefined;

  const db = {
    member: {
      findUnique: async () => null
    },
    auditLog: {
      create: async ({ data }: { data: { actorUserId?: string | null } }) => {
        actorUserIdWritten = data.actorUserId;
        return { id: 'audit_2' };
      }
    }
  };

  await writeAuditLog(db as any, {
    orgId: 'org_1',
    actorUserId: 'user_without_member',
    action: 'charge.created',
    entityType: 'charge',
    entityId: 'charge_2'
  });

  assert.equal(actorUserIdWritten, null);
});
