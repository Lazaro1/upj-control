import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateMemberStatementPDF, generateFichaVisualPDF } from '@/features/reports/server/pdf-service';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await auth();
    if (!orgId) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'extrato';

    let stream;
    let filename = '';

    if (type === 'ficha') {
      stream = await generateFichaVisualPDF(id);
      filename = `ficha-${id}.pdf`;
    } else {
      stream = await generateMemberStatementPDF(id);
      filename = `extrato-${id}.pdf`;
    }
    
    const actorMember = await prisma.member.findUnique({
      where: { clerkUserId: userId || '' }
    });

    // Audit Log entry
    await prisma.auditLog.create({
      data: {
        actorUserId: actorMember ? userId : null,
        action: `report.generated.${type}`,
        entityType: 'member',
        entityId: id,
        newDataJson: { 
          type, 
          filename, 
          actorClerkId: userId // Still recorded in JSON even if not linked via FK
        }
      }
    });
    
    const chunks: any[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    console.error('[PDF_GEN_ERROR]', error);
    return new NextResponse(error.message || 'Erro interno', { status: 500 });
  }
}
