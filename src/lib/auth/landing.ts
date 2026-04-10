import { prisma } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

type DashboardRole =
  | 'org:admin'
  | 'org:treasurer'
  | 'org:manager'
  | 'org:member';

interface ResolveDashboardLandingInput {
  userId: string | null;
  orgRole: string | null | undefined;
}

const ADMIN_DASHBOARD_ROLES: DashboardRole[] = [
  'org:admin',
  'org:treasurer',
  'org:manager'
];

export async function resolveDashboardLanding({
  userId,
  orgRole
}: ResolveDashboardLandingInput): Promise<string> {
  if (!userId) {
    return '/auth/sign-in';
  }

  // Roles administrativos vão direto para o dashboard
  if (orgRole && ADMIN_DASHBOARD_ROLES.includes(orgRole as DashboardRole)) {
    return '/dashboard/overview';
  }

  // Verificar se já existe vínculo pelo clerkUserId
  const linkedMember = await prisma.member.findUnique({
    where: { clerkUserId: userId },
    select: { id: true }
  });

  if (linkedMember) {
    return '/dashboard/portal';
  }

  // Não está vinculado — verificar se o email existe na tabela members
  // Se sim, redirecionar para verificação de CIM (antes de entrar no layout do dashboard)
  const user = await currentUser();
  if (user) {
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (primaryEmail) {
      const memberByEmail = await prisma.member.findUnique({
        where: { email: primaryEmail },
        select: { id: true, clerkUserId: true }
      });

      if (memberByEmail && !memberByEmail.clerkUserId) {
        // Membro existe mas não vinculado → pedir CIM
        return '/auth/verify-cim';
      }

      if (!memberByEmail) {
        // Email não existe na tesouraria
        return '/auth/unauthorized';
      }
    } else {
      return '/auth/unauthorized';
    }
  }

  if (orgRole === 'org:member') {
    return '/dashboard/portal';
  }

  return '/dashboard/workspaces';
}
