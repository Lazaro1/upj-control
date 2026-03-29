import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMemberFinancialPosition } from '@/features/reports/server/report.actions';
import { arrayToCSV, csvResponse } from '@/features/reports/server/csv-export';

export async function GET(req: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();
    if (!orgId || orgRole === 'org:member') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const result = await getMemberFinancialPosition(dateFrom, dateTo);
    if (!result.success || !result.data) {
      return new NextResponse(result.error || 'Erro ao gerar relatório', {
        status: 500
      });
    }

    const headers = [
      { key: 'memberName', label: 'Membro' },
      { key: 'totalCharged', label: 'Total Cobrado' },
      { key: 'totalPaid', label: 'Total Pago' },
      { key: 'balance', label: 'Saldo' }
    ];

    const rows = result.data.map((item) => ({
      memberName: item.memberName,
      totalCharged: item.totalCharged,
      totalPaid: item.totalPaid,
      balance: item.balance
    }));

    const csv = arrayToCSV(headers, rows);
    const suffix = `${dateFrom || 'inicio'}-${dateTo || 'hoje'}`;

    return csvResponse(csv, `posicao-membros-${suffix}.csv`);
  } catch (error: any) {
    console.error('[REPORT_MEMBER_POSITION_CSV_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
