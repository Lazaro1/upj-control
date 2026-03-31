import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { StatementTemplate } from '../components/pdf/statement-template';
import { FichaVisualTemplate } from '../components/pdf/ficha-visual-template';
import { ReportTemplate } from '../components/pdf/report-template';
import { DelinquencyTemplate } from '../components/pdf/delinquency-template';
import { getMemberStatement } from '@/features/statements/server/statement.actions';
import {
  getConsolidatedBalance,
  getDelinquencyReport,
  getExpenseReport,
  getIncomeReport,
  type DelinquencyReportFilters
} from './report.actions';
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

export async function generateIncomeReportPDF(
  dateFrom?: string,
  dateTo?: string
) {
  const result = await getIncomeReport(dateFrom, dateTo);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Falha ao buscar relatório de entradas');
  }

  const rows = [
    ...result.data.paymentEntries.map((entry) => ({
      source: `Pagamento - ${entry.source}`,
      total: entry.total
    })),
    ...result.data.cashEntries.map((entry) => ({
      source: `Caixa - ${entry.source}`,
      total: entry.total
    }))
  ];

  const generatedAt = new Date().toLocaleString('pt-BR');

  return renderToStream(
    <ReportTemplate
      title='Relatório de Entradas'
      subtitle={`Período: ${dateFrom || 'início'} até ${dateTo || 'hoje'}`}
      columns={[
        { key: 'source', label: 'Origem', width: '70%', align: 'left' },
        { key: 'total', label: 'Total (R$)', width: '30%', align: 'right' }
      ]}
      rows={rows}
      summary={[
        {
          label: 'Total Geral',
          value: result.data.grandTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        }
      ]}
      generatedAt={generatedAt}
    />
  );
}

export async function generateExpenseReportPDF(
  dateFrom?: string,
  dateTo?: string
) {
  const result = await getExpenseReport(dateFrom, dateTo);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Falha ao buscar relatório de saídas');
  }

  const rows = result.data.expenses.map((expense) => ({
    category: expense.category,
    total: expense.total
  }));

  const generatedAt = new Date().toLocaleString('pt-BR');

  return renderToStream(
    <ReportTemplate
      title='Relatório de Saídas'
      subtitle={`Período: ${dateFrom || 'início'} até ${dateTo || 'hoje'}`}
      columns={[
        { key: 'category', label: 'Categoria', width: '70%', align: 'left' },
        { key: 'total', label: 'Total (R$)', width: '30%', align: 'right' }
      ]}
      rows={rows}
      summary={[
        {
          label: 'Total Geral',
          value: result.data.grandTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        }
      ]}
      generatedAt={generatedAt}
    />
  );
}

export async function generateConsolidatedPDF(
  dateFrom?: string,
  dateTo?: string
) {
  const result = await getConsolidatedBalance(dateFrom, dateTo);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Falha ao buscar balanço consolidado');
  }

  const rows = [
    { description: 'Total Entradas', value: result.data.totalEntradas },
    { description: 'Total Saídas', value: result.data.totalSaidas },
    { description: 'Saldo', value: result.data.saldo }
  ];

  const generatedAt = new Date().toLocaleString('pt-BR');

  return renderToStream(
    <ReportTemplate
      title='Balanço Consolidado'
      subtitle={`Período: ${dateFrom || 'início'} até ${dateTo || 'hoje'}`}
      columns={[
        { key: 'description', label: 'Descrição', width: '70%', align: 'left' },
        { key: 'value', label: 'Valor (R$)', width: '30%', align: 'right' }
      ]}
      rows={rows}
      generatedAt={generatedAt}
    />
  );
}

export async function generateDelinquencyReportPDF(
  filters: DelinquencyReportFilters
) {
  const result = await getDelinquencyReport(filters);

  if (!result.success || !result.data) {
    throw new Error(
      result.error || 'Falha ao buscar relatorio de inadimplencia'
    );
  }

  const generatedAt = new Date().toLocaleString('pt-BR');

  const subtitle = `Vencimento: ${filters.dueDateFrom || 'inicio'} ate ${
    filters.dueDateTo || 'hoje'
  }${filters.chargeTypeId ? ' | Tipo filtrado' : ''}`;

  return renderToStream(
    <DelinquencyTemplate
      subtitle={subtitle}
      generatedAt={generatedAt}
      summaries={result.data.summaries}
      details={result.data.details}
      totals={result.data.totals}
    />
  );
}
