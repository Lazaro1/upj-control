import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { forbidden, redirect } from 'next/navigation';

import {
  FINANCIAL_WRITE_ROLES,
  hasRole,
  MEMBER_WRITE_ROLES,
  STAFF_ROLES
} from '@/lib/auth/roles.constants';

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
