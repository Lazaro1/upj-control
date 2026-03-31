import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { arrayToCSV, csvResponse } from '@/features/reports/server/csv-export';
import { getDelinquencyReport } from '@/features/reports/server/report.actions';
import { prisma } from '@/lib/db';

function formatDateForCsv(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

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

    const result = await getDelinquencyReport({
      dueDateFrom,
      dueDateTo,
      chargeTypeId
    });

    if (!result.success || !result.data) {
      return new NextResponse(result.error || 'Erro ao gerar relatorio', {
        status: 500
      });
    }

    const headers = [
      { key: 'section', label: 'Secao' },
      { key: 'memberName', label: 'Irmao' },
      { key: 'overdueCount', label: 'Qtd. vencidas' },
      { key: 'totalOpenAmount', label: 'Total em aberto (R$)' },
      { key: 'oldestDueDate', label: 'Mais antiga' },
      { key: 'chargeTypeName', label: 'Tipo cobranca' },
      { key: 'dueDate', label: 'Vencimento' },
      { key: 'daysOverdue', label: 'Dias atraso' },
      { key: 'openAmount', label: 'Valor em aberto (R$)' }
    ];

    const summaryRows = result.data.summaries.map((row) => ({
      section: 'Consolidado',
      memberName: row.memberName,
      overdueCount: row.overdueCount,
      totalOpenAmount: row.totalOpenAmount,
      oldestDueDate: formatDateForCsv(row.oldestDueDate),
      chargeTypeName: '',
      dueDate: '',
      daysOverdue: '',
      openAmount: ''
    }));

    const detailRows = result.data.details.map((row) => ({
      section: 'Detalhado',
      memberName: row.memberName,
      overdueCount: '',
      totalOpenAmount: '',
      oldestDueDate: '',
      chargeTypeName: row.chargeTypeName,
      dueDate: formatDateForCsv(row.dueDate),
      daysOverdue: row.daysOverdue,
      openAmount: row.openAmount
    }));

    const csv = arrayToCSV(headers, [...summaryRows, ...detailRows]);
    const suffix = `${dueDateFrom || 'inicio'}-${dueDateTo || 'hoje'}`;

    const actorMember = await prisma.member.findUnique({
      where: { clerkUserId: userId || '' }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actorMember ? userId : null,
        action: 'report.generated.delinquency.csv',
        entityType: 'report',
        entityId: orgId,
        newDataJson: {
          format: 'csv',
          filters: {
            dueDateFrom,
            dueDateTo,
            chargeTypeId
          },
          rows: summaryRows.length + detailRows.length,
          orgId
        }
      }
    });

    return csvResponse(csv, `relatorio-inadimplencia-${suffix}.csv`);
  } catch (error: any) {
    console.error('[REPORT_DELINQUENCY_CSV_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
