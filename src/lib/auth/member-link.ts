import { clerkClient } from '@clerk/nextjs/server';

import { isStaffRole, STAFF_ROLES } from '@/lib/auth/roles';
import { prisma } from '@/lib/db';

/** @deprecated Use STAFF_ROLES from @/lib/auth/roles */
export const ADMIN_ROLES = STAFF_ROLES;

export function isAdminRole(orgRole: string | null | undefined): boolean {
  return isStaffRole(orgRole);
}

export function getAdminDashboardPath(): string {
  return '/dashboard/overview';
}

export function getMemberDashboardPath(): string {
  return '/dashboard/portal';
}

export async function getPrimaryEmailByUserId(
  userId: string
): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return (
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null
  );
}

export async function findLinkedMember(
  userId: string,
  primaryEmail?: string | null
) {
  const linkedByClerkId = await prisma.member.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, clerkUserId: true, email: true }
  });

  if (linkedByClerkId) {
    return linkedByClerkId;
  }

  const email = primaryEmail ?? (await getPrimaryEmailByUserId(userId));
  if (!email) {
    return null;
  }

  const memberByEmail = await prisma.member.findUnique({
    where: { email },
    select: { id: true, clerkUserId: true, email: true }
  });

  if (memberByEmail?.clerkUserId === userId) {
    return memberByEmail;
  }

  return null;
}

export async function resolvePostAuthPath(
  userId: string,
  orgRole: string | null | undefined
): Promise<string> {
  if (isAdminRole(orgRole)) {
    return getAdminDashboardPath();
  }

  const primaryEmail = await getPrimaryEmailByUserId(userId);
  const linkedMember = await findLinkedMember(userId, primaryEmail);

  if (linkedMember) {
    return getMemberDashboardPath();
  }

  if (!primaryEmail) {
    return '/auth/unauthorized';
  }

  const memberByEmail = await prisma.member.findUnique({
    where: { email: primaryEmail },
    select: { id: true, clerkUserId: true }
  });

  if (!memberByEmail) {
    return '/auth/unauthorized';
  }

  if (!memberByEmail.clerkUserId) {
    return '/auth/verify-cim';
  }

  if (orgRole === 'org:member') {
    return getMemberDashboardPath();
  }

  return '/auth/verify-cim';
}
