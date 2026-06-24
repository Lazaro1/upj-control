'use client';

/**
 * Fully client-side hook for filtering navigation items based on RBAC
 *
 * This hook uses Clerk's client-side hooks to check permissions, roles, and organization
 * without any server calls. This is perfect for navigation visibility (UX only).
 *
 * Performance:
 * - All checks are synchronous (no server calls)
 * - Instant filtering
 * - No loading states
 * - No UI flashing
 *
 * Note: For actual security (API routes, server actions), always use server-side checks.
 * This is only for UI visibility.
 */

import { useMemo } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import type { NavItem, PermissionCheck } from '@/types';

interface AccessContext {
  role?: string;
  hasOrg: boolean;
  permissions: string[];
}

function passesAccessCheck(
  access: PermissionCheck | undefined,
  accessContext: AccessContext
): boolean {
  if (!access) {
    return true;
  }

  if (access.role) {
    if (accessContext.role !== access.role) {
      return false;
    }
  }

  if (access.requireOrg && !accessContext.hasOrg) {
    return false;
  }

  if (access.permission) {
    if (!accessContext.hasOrg) {
      return false;
    }
    if (!accessContext.permissions.includes(access.permission)) {
      return false;
    }
  }

  if (access.roles && access.roles.length > 0) {
    if (!accessContext.role || !access.roles.includes(accessContext.role)) {
      return false;
    }
  }

  if (access.excludeRole) {
    if (accessContext.role === access.excludeRole) {
      return false;
    }
  }

  if (access.plan || access.feature) {
    console.warn(
      `Plan/feature checks for navigation items require server-side verification. ` +
        `Item will be shown, but page-level protection should be implemented.`
    );
  }

  return true;
}

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const { organization, membership } = useOrganization();
  const { user } = useUser();
  const { orgId, orgRole } = useAuth();

  // Memoize context and permissions
  const accessContext = useMemo(() => {
    const permissions = membership?.permissions || [];
    const role = membership?.role || orgRole;
    const hasOrg = !!organization || !!membership || !!orgId;

    return {
      organization: organization ?? undefined,
      user: user ?? undefined,
      permissions: permissions as string[],
      role: role ?? undefined,
      hasOrg
    };
  }, [
    organization?.id,
    user?.id,
    membership?.permissions,
    membership?.role,
    orgId,
    orgRole
  ]);

  // Filter items synchronously (all client-side)
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => passesAccessCheck(item.access, accessContext))
      .map((item) => {
        // Recursively filter child items
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) =>
            passesAccessCheck(childItem.access, accessContext)
          );

          return {
            ...item,
            items: filteredChildren
          };
        }

        return item;
      });
  }, [items, accessContext]);

  return filteredItems;
}
