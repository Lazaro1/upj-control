import { prisma } from '@/lib/db';

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

  if (orgRole === 'org:member') {
    return '/dashboard/portal';
  }

  if (orgRole && ADMIN_DASHBOARD_ROLES.includes(orgRole as DashboardRole)) {
    return '/dashboard/overview';
  }

  const member = await prisma.member.findUnique({
    where: { clerkUserId: userId },
    select: { id: true }
  });

  if (member) {
    return '/dashboard/portal';
  }

  return '/dashboard/workspaces';
}
