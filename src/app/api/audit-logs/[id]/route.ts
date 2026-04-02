import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuditLogById } from '@/features/audit-logs/server/audit-log.actions';

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, orgRole } = await auth();
    const denied = assertAccess(orgId, orgRole);
    if (denied) return denied;

    const { id } = await params;
    const result = await getAuditLogById(id);

    if (!result.success || !result.data) {
      return new NextResponse(result.error || 'Log nao encontrado', {
        status: 404
      });
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}

export async function PUT() {
  return new NextResponse('Metodo nao permitido', { status: 405 });
}

export async function PATCH() {
  return new NextResponse('Metodo nao permitido', { status: 405 });
}

export async function DELETE() {
  return new NextResponse('Metodo nao permitido', { status: 405 });
}
