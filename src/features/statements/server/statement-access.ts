import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { hasRole, STAFF_ROLES } from '@/lib/auth/roles';

export async function assertMemberStatementAccess(memberId: string) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new Error('Não autorizado');
  }

  if (orgId && hasRole(orgRole, STAFF_ROLES)) {
    return { userId, orgRole, isSelf: false };
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, clerkUserId: true }
  });

  if (!member) {
    throw new Error('Membro não encontrado');
  }

  if (member.clerkUserId === userId) {
    return { userId, orgRole, isSelf: true };
  }

  throw new Error('Não autorizado');
}
