import { auth } from '@clerk/nextjs/server';
import { forbidden, redirect } from 'next/navigation';

export const ORG_ROLES = {
  ADMIN: 'org:admin',
  TREASURER: 'org:treasurer',
  MANAGER: 'org:manager',
  MEMBER: 'org:member'
} as const;

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];

export const STAFF_ROLES: OrgRole[] = [
  ORG_ROLES.ADMIN,
  ORG_ROLES.TREASURER,
  ORG_ROLES.MANAGER
];

export const FINANCIAL_WRITE_ROLES: OrgRole[] = [
  ORG_ROLES.ADMIN,
  ORG_ROLES.TREASURER
];

export const MEMBER_WRITE_ROLES: OrgRole[] = [
  ORG_ROLES.ADMIN,
  ORG_ROLES.TREASURER,
  ORG_ROLES.MANAGER
];

export function hasRole(
  orgRole: string | null | undefined,
  allowed: readonly string[]
): boolean {
  return Boolean(orgRole && allowed.includes(orgRole));
}

export function isStaffRole(orgRole: string | null | undefined): boolean {
  return hasRole(orgRole, STAFF_ROLES);
}

export function canFinancialWrite(orgRole: string | null | undefined): boolean {
  return hasRole(orgRole, FINANCIAL_WRITE_ROLES);
}

export function canMemberWrite(orgRole: string | null | undefined): boolean {
  return hasRole(orgRole, MEMBER_WRITE_ROLES);
}

export type StaffAccessDenial = 'unauthorized' | 'forbidden';

export function getStaffAccessDenial(
  orgId: string | null | undefined,
  orgRole: string | null | undefined
): StaffAccessDenial | null {
  if (!orgId) {
    return 'unauthorized';
  }

  if (!hasRole(orgRole, STAFF_ROLES)) {
    return 'forbidden';
  }

  return null;
}

export interface AuthContext {
  userId: string;
  orgId: string;
  orgRole: string;
}

export async function requireStaffAuth(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error('Não autorizado');
  }

  if (!orgRole || !hasRole(orgRole, STAFF_ROLES)) {
    throw new Error('Acesso negado');
  }

  return { userId, orgId, orgRole };
}

export async function requireFinancialWrite(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error('Não autorizado');
  }

  if (!orgRole || !hasRole(orgRole, FINANCIAL_WRITE_ROLES)) {
    throw new Error('Acesso negado');
  }

  return { userId, orgId, orgRole };
}

export async function requireMemberWrite(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    throw new Error('Não autorizado');
  }

  if (!orgRole || !hasRole(orgRole, MEMBER_WRITE_ROLES)) {
    throw new Error('Acesso negado');
  }

  return { userId, orgId, orgRole };
}

export async function assertFinancialWritePage(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!orgId) {
    redirect('/auth/sign-in');
  }

  if (!userId) {
    redirect('/auth/sign-in');
  }

  if (!orgRole || !hasRole(orgRole, FINANCIAL_WRITE_ROLES)) {
    forbidden();
  }

  return { userId, orgId, orgRole };
}
