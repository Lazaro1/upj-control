import { NextResponse } from 'next/server';

import { getStaffAccessDenial } from '@/lib/auth/roles';

export function denyStaffApiAccess(
  orgId: string | null | undefined,
  orgRole: string | null | undefined
): NextResponse | null {
  const denial = getStaffAccessDenial(orgId, orgRole);

  if (denial === 'unauthorized') {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  if (denial === 'forbidden') {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  return null;
}
