import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateDelinquencyReportPDF } from '@/features/reports/server/pdf-service';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { orgId, orgRole, userId } = await auth();
    const allowedRoles = new Set(['org:treasurer', 'org:manager', 'org:admin']);

    if (!orgId) {
      return new NextResponse('Nao autorizado', { status: 401 });
    }

    if (!orgRole || !allowedRoles.has(orgRole)) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dueDateFrom = searchParams.get('dueDateFrom') || undefined;
    const dueDateTo = searchParams.get('dueDateTo') || undefined;
    const chargeTypeId = searchParams.get('chargeTypeId') || undefined;

    const stream = await generateDelinquencyReportPDF({
      dueDateFrom,
      dueDateTo,
      chargeTypeId
    });

    const chunks: Buffer[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }

    const actorMember = await prisma.member.findUnique({
      where: { clerkUserId: userId || '' }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actorMember ? userId : null,
        action: 'report.generated.delinquency.pdf',
        entityType: 'report',
        entityId: orgId,
        newDataJson: {
          format: 'pdf',
          filters: {
            dueDateFrom,
            dueDateTo,
            chargeTypeId
          },
          orgId
        }
      }
    });

    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="relatorio-inadimplencia.pdf"'
      }
    });
  } catch (error: any) {
    console.error('[REPORT_DELINQUENCY_PDF_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
