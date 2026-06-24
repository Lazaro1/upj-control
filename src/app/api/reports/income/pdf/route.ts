import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateIncomeReportPDF } from '@/features/reports/server/pdf-service';

import { denyStaffApiAccess } from '@/lib/auth/api-access';

export async function GET(req: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();
    const denied = denyStaffApiAccess(orgId, orgRole);
    if (denied) return denied;

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const stream = await generateIncomeReportPDF(dateFrom, dateTo);

    const chunks: any[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio-entradas.pdf"'
      }
    });
  } catch (error: any) {
    console.error('[REPORT_INCOME_PDF_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
