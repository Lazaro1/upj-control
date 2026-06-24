import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  generateMemberStatementPDF,
  generateFichaVisualPDF
} from '@/features/reports/server/pdf-service';
import { assertMemberStatementAccess } from '@/features/statements/server/statement-access';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await assertMemberStatementAccess(id);

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

    const { userId } = await auth();
    const actorMember = await prisma.member.findUnique({
      where: { clerkUserId: userId || '' }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: actorMember ? userId : null,
        action: `report.generated.${type}`,
        entityType: 'member',
        entityId: id,
        newDataJson: {
          type,
          filename,
          actorClerkId: userId
        }
      }
    });

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
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
  } catch (error: unknown) {
    console.error('[PDF_GEN_ERROR]', error);
    const message =
      error instanceof Error ? error.message : 'Erro interno';
    const status = message === 'Não autorizado' ? 401 : 500;

    return new NextResponse(message, { status });
  }
}
