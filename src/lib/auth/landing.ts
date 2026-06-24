import { resolvePostAuthPath } from '@/lib/auth/member-link';

interface ResolveDashboardLandingInput {
  userId: string | null;
  orgRole: string | null | undefined;
}

export async function resolveDashboardLanding({
  userId,
  orgRole
}: ResolveDashboardLandingInput): Promise<string> {
  if (!userId) {
    return '/auth/sign-in';
  }

  return resolvePostAuthPath(userId, orgRole);
}
