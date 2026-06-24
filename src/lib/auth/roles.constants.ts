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
