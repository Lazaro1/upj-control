import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { StatementTemplate } from '../components/pdf/statement-template';
import { FichaVisualTemplate } from '../components/pdf/ficha-visual-template';
import { getMemberStatement } from '@/features/statements/server/statement.actions';
import { prisma } from '@/lib/db';

export async function generateMemberStatementPDF(memberId: string) {
  const result = await getMemberStatement(memberId);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Falha ao buscar dados para o PDF');
  }

  const { data } = result;
  const generatedAt = new Date().toLocaleString('pt-BR');

  const stream = await renderToStream(
    <StatementTemplate
      memberName={data.memberName}
      creditBalance={data.creditBalance}
      totalCharged={data.totalCharged}
      totalPaid={data.totalPaid}
      pendingAmount={data.pendingAmount}
      entries={data.entries}
      generatedAt={generatedAt}
    />
  );

  return stream;
}

export async function generateFichaVisualPDF(memberId: string) {
  const [member, statement] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId }
    }),
    getMemberStatement(memberId)
  ]);

  if (!member || !statement.success || !statement.data) {
    throw new Error('Membro ou extrato não encontrado');
  }

  const generatedAt = new Date().toLocaleString('pt-BR');

  const stream = await renderToStream(
    <FichaVisualTemplate
      member={{
        ...member,
        creditBalance: Number(member.creditBalance),
        joinedAt: member.joinedAt?.toISOString() || null
      }}
      entries={statement.data.entries}
      generatedAt={generatedAt}
    />
  );

  return stream;
}
