import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuditLogs } from '@/features/audit-logs/server/audit-log.actions';

function assertAccess(
  orgId: string | null | undefined,
  orgRole: string | null | undefined
) {
  const allowedRoles = new Set(['org:treasurer', 'org:manager', 'org:admin']);

  if (!orgId) {
    return new NextResponse('Nao autorizado', { status: 401 });
  }

  if (!orgRole || !allowedRoles.has(orgRole)) {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();
    const denied = assertAccess(orgId, orgRole);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const actorUserId = searchParams.get('actorUserId') || undefined;
    const action = searchParams.get('action') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const result = await getAuditLogs({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      actorUserId,
      action,
      dateFrom,
      dateTo
    });

    if (!result.success || !result.data) {
      const status = result.error?.includes('dateFrom') ? 400 : 500;
      return new NextResponse(result.error || 'Erro ao consultar auditoria', {
        status
      });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
