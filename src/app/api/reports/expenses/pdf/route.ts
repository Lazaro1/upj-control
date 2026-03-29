import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateExpenseReportPDF } from '@/features/reports/server/pdf-service';

export async function GET(req: NextRequest) {
  try {
    const { orgId, orgRole } = await auth();
    if (!orgId || orgRole === 'org:member') {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const stream = await generateExpenseReportPDF(dateFrom, dateTo);

    const chunks: any[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio-saidas.pdf"'
      }
    });
  } catch (error: any) {
    console.error('[REPORT_EXPENSES_PDF_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
