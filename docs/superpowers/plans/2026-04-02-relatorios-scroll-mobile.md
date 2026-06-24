# Relatorios Mobile Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir scroll horizontal no mobile dentro dos containers das tabelas e do grafico de relatorios, sem alterar o layout geral.

**Architecture:** Introduzir um wrapper reutilizavel (`ReportTableWrapper`) com `overflow-x-auto` e `touch-pan-x`, e aplicar esse wrapper em todas as tabelas dos relatorios e no grafico “Por tipo de cobranca”. Nao ha mudancas no `PageContainer` nem no fluxo de dados.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, shadcn/ui.

---

## File Structure

**Create:**

- `src/features/reports/components/report-table-wrapper.tsx` — wrapper reutilizavel para scroll horizontal.
- `src/features/reports/components/__tests__/report-table-wrapper.test.ts` — teste unitario do wrapper.
- `src/features/reports/components/__tests__/report-tables-scroll.test.ts` — testes de scroll para tabelas (entradas/saidas/posicao).
- `src/features/reports/components/__tests__/report-delinquency-scroll.test.ts` — testes de scroll para inadimplencia.
- `src/features/reports/components/__tests__/report-chart-scroll.test.ts` — teste de scroll para grafico.

**Modify:**

- `src/features/reports/components/income-report-table.tsx`
- `src/features/reports/components/expense-report-table.tsx`
- `src/features/reports/components/member-position-table.tsx`
- `src/features/reports/components/delinquency-report-table.tsx`
- `src/features/reports/components/delinquency-report-details.tsx`
- `src/features/reports/components/receipts-by-type-chart.tsx`

---

### Task 1: Criar ReportTableWrapper com teste

**Files:**

- Create: `src/features/reports/components/report-table-wrapper.tsx`
- Create: `src/features/reports/components/__tests__/report-table-wrapper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReportTableWrapper } from '../report-table-wrapper';

describe('ReportTableWrapper', () => {
  it('aplica container com scroll horizontal e classe de largura minima', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ReportTableWrapper,
        { contentClassName: 'min-w-[680px]' },
        React.createElement('table', { className: 'w-full text-sm' })
      )
    );

    assert.ok(html.includes('overflow-x-auto'));
    assert.ok(html.includes('touch-pan-x'));
    assert.ok(html.includes('rounded-md'));
    assert.ok(html.includes('border'));
    assert.ok(html.includes('min-w-[680px]'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test "src/features/reports/components/__tests__/report-table-wrapper.test.ts"`
Expected: FAIL with "Cannot find module '../report-table-wrapper'".

- [ ] **Step 3: Write minimal implementation**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ReportTableWrapperProps extends React.ComponentProps<'div'> {
  contentClassName?: string;
}

export function ReportTableWrapper({
  className,
  contentClassName,
  children,
  ...props
}: ReportTableWrapperProps) {
  return (
    <div
      className={cn(
        'min-w-0 touch-pan-x overflow-x-auto rounded-md border',
        className
      )}
      {...props}
    >
      <div className={cn('min-w-[640px]', contentClassName)}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test "src/features/reports/components/__tests__/report-table-wrapper.test.ts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reports/components/report-table-wrapper.tsx src/features/reports/components/__tests__/report-table-wrapper.test.ts
git commit -m "feat: add report table wrapper for horizontal scroll"
```

---

### Task 2: Aplicar wrapper nas tabelas de entradas/saidas/posicao

**Files:**

- Modify: `src/features/reports/components/income-report-table.tsx`
- Modify: `src/features/reports/components/expense-report-table.tsx`
- Modify: `src/features/reports/components/member-position-table.tsx`
- Create: `src/features/reports/components/__tests__/report-tables-scroll.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IncomeReportTable } from '../income-report-table';
import { ExpenseReportTable } from '../expense-report-table';
import { MemberPositionTable } from '../member-position-table';

function assertScrollable(html: string, minWidth: string) {
  assert.ok(html.includes('overflow-x-auto'));
  assert.ok(html.includes('touch-pan-x'));
  assert.ok(html.includes(minWidth));
}

describe('Report tables scroll wrapper', () => {
  it('renderiza wrapper na tabela de entradas', () => {
    const html = renderToStaticMarkup(
      React.createElement(IncomeReportTable, {
        data: {
          paymentEntries: [{ source: 'PIX', total: 100 }],
          cashEntries: [{ source: 'Caixa', total: 50 }],
          grandTotal: 150
        }
      })
    );

    assertScrollable(html, 'min-w-[680px]');
  });

  it('renderiza wrapper na tabela de saidas', () => {
    const html = renderToStaticMarkup(
      React.createElement(ExpenseReportTable, {
        data: {
          expenses: [{ category: 'Operacional', total: 75 }],
          grandTotal: 75
        }
      })
    );

    assertScrollable(html, 'min-w-[680px]');
  });

  it('renderiza wrapper na tabela de posicao dos membros', () => {
    const html = renderToStaticMarkup(
      React.createElement(MemberPositionTable, {
        data: [
          {
            memberId: 'm1',
            memberName: 'Joao',
            totalCharged: 100,
            totalPaid: 80,
            balance: 20
          }
        ]
      })
    );

    assertScrollable(html, 'min-w-[680px]');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test "src/features/reports/components/__tests__/report-tables-scroll.test.ts"`
Expected: FAIL because components still use the old wrapper markup.

- [ ] **Step 3: Update IncomeReportTable**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportTableWrapper } from './report-table-wrapper';

interface IncomeEntry {
  source: string;
  total: number;
}

interface IncomeReportData {
  paymentEntries: IncomeEntry[];
  cashEntries: IncomeEntry[];
  grandTotal: number;
}

interface IncomeReportTableProps {
  data: IncomeReportData;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function IncomeReportTable({ data }: IncomeReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatorio de Entradas</CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <section className='space-y-3'>
          <h3 className='text-base font-semibold'>Recebimentos (Pagamentos)</h3>
          <ReportTableWrapper contentClassName='min-w-[680px]'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-4 py-2 text-left font-medium'>
                    Metodo de Pagamento
                  </th>
                  <th className='px-4 py-2 text-right font-medium'>
                    Total (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.paymentEntries.map((entry) => (
                  <tr key={`${entry.source}-payment`} className='border-t'>
                    <td className='px-4 py-2'>{entry.source}</td>
                    <td className='px-4 py-2 text-right'>
                      {currencyFormatter.format(entry.total)}
                    </td>
                  </tr>
                ))}
                {data.paymentEntries.length === 0 && (
                  <tr className='border-t'>
                    <td
                      colSpan={2}
                      className='text-muted-foreground px-4 py-6 text-center'
                    >
                      Nenhum recebimento encontrado no periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ReportTableWrapper>
        </section>

        <section className='space-y-3'>
          <h3 className='text-base font-semibold'>Entradas Avulsas (Caixa)</h3>
          <ReportTableWrapper contentClassName='min-w-[680px]'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-4 py-2 text-left font-medium'>Categoria</th>
                  <th className='px-4 py-2 text-right font-medium'>
                    Total (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.cashEntries.map((entry) => (
                  <tr key={`${entry.source}-cash`} className='border-t'>
                    <td className='px-4 py-2'>{entry.source}</td>
                    <td className='px-4 py-2 text-right'>
                      {currencyFormatter.format(entry.total)}
                    </td>
                  </tr>
                ))}
                {data.cashEntries.length === 0 && (
                  <tr className='border-t'>
                    <td
                      colSpan={2}
                      className='text-muted-foreground px-4 py-6 text-center'
                    >
                      Nenhuma entrada avulsa encontrada no periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ReportTableWrapper>
        </section>

        <div className='bg-muted/40 flex items-center justify-between rounded-md border px-4 py-3'>
          <span className='text-sm font-medium'>Total Geral</span>
          <span className='text-lg font-semibold'>
            {currencyFormatter.format(data.grandTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Update ExpenseReportTable**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportTableWrapper } from './report-table-wrapper';

interface ExpenseItem {
  category: string;
  total: number;
}

interface ExpenseReportData {
  expenses: ExpenseItem[];
  grandTotal: number;
}

interface ExpenseReportTableProps {
  data: ExpenseReportData;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function ExpenseReportTable({ data }: ExpenseReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatorio de Saidas</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ReportTableWrapper contentClassName='min-w-[680px]'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='px-4 py-2 text-left font-medium'>Categoria</th>
                <th className='px-4 py-2 text-right font-medium'>Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense) => (
                <tr key={expense.category} className='border-t'>
                  <td className='px-4 py-2'>{expense.category}</td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(expense.total)}
                  </td>
                </tr>
              ))}
              {data.expenses.length === 0 && (
                <tr className='border-t'>
                  <td
                    colSpan={2}
                    className='text-muted-foreground px-4 py-6 text-center'
                  >
                    Nenhuma saida encontrada no periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ReportTableWrapper>

        <div className='bg-muted/40 flex items-center justify-between rounded-md border px-4 py-3'>
          <span className='text-sm font-medium'>Total Geral</span>
          <span className='text-lg font-semibold'>
            {currencyFormatter.format(data.grandTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Update MemberPositionTable**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportTableWrapper } from './report-table-wrapper';

interface MemberFinancialPosition {
  memberId: string;
  memberName: string;
  totalCharged: number;
  totalPaid: number;
  balance: number;
}

interface MemberPositionTableProps {
  data: MemberFinancialPosition[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function MemberPositionTable({ data }: MemberPositionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posicao Financeira dos Membros</CardTitle>
      </CardHeader>
      <CardContent>
        <ReportTableWrapper contentClassName='min-w-[680px]'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='px-4 py-2 text-left font-medium'>Membro</th>
                <th className='px-4 py-2 text-right font-medium'>
                  Total Cobrado
                </th>
                <th className='px-4 py-2 text-right font-medium'>Total Pago</th>
                <th className='px-4 py-2 text-right font-medium'>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((member) => (
                <tr key={member.memberId} className='border-t'>
                  <td className='px-4 py-2'>{member.memberName}</td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(member.totalCharged)}
                  </td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(member.totalPaid)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      member.balance > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {currencyFormatter.format(member.balance)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr className='border-t'>
                  <td
                    colSpan={4}
                    className='text-muted-foreground px-4 py-6 text-center'
                  >
                    Nenhum membro ativo encontrado para o periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ReportTableWrapper>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test "src/features/reports/components/__tests__/report-tables-scroll.test.ts"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/reports/components/income-report-table.tsx src/features/reports/components/expense-report-table.tsx src/features/reports/components/member-position-table.tsx src/features/reports/components/__tests__/report-tables-scroll.test.ts
git commit -m "fix: add horizontal scroll wrapper to report tables"
```

---

### Task 3: Aplicar wrapper nas tabelas de inadimplencia

**Files:**

- Modify: `src/features/reports/components/delinquency-report-table.tsx`
- Modify: `src/features/reports/components/delinquency-report-details.tsx`
- Create: `src/features/reports/components/__tests__/report-delinquency-scroll.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DelinquencyReportTable } from '../delinquency-report-table';
import { DelinquencyReportDetails } from '../delinquency-report-details';

function assertScrollable(html: string, minWidth: string) {
  assert.ok(html.includes('overflow-x-auto'));
  assert.ok(html.includes('touch-pan-x'));
  assert.ok(html.includes(minWidth));
}

describe('Delinquency report scroll wrapper', () => {
  it('renderiza wrapper na tabela resumo', () => {
    const html = renderToStaticMarkup(
      React.createElement(DelinquencyReportTable, {
        summaries: [
          {
            memberId: 'm1',
            memberName: 'Jose',
            overdueCount: 2,
            totalOpenAmount: 50,
            oldestDueDate: '2024-01-01'
          }
        ],
        details: [
          {
            chargeId: 'c1',
            memberId: 'm1',
            memberName: 'Jose',
            chargeTypeName: 'Mensal',
            dueDate: '2024-01-01',
            openAmount: 25,
            daysOverdue: 10
          }
        ],
        totals: { members: 1, overdueCharges: 2, totalOpenAmount: 50 }
      })
    );

    assertScrollable(html, 'min-w-[680px]');
  });

  it('renderiza wrapper na tabela de detalhes', () => {
    const html = renderToStaticMarkup(
      React.createElement(DelinquencyReportDetails, {
        details: [
          {
            chargeId: 'c1',
            chargeTypeName: 'Mensal',
            dueDate: '2024-01-01',
            openAmount: 25,
            daysOverdue: 10
          }
        ]
      })
    );

    assertScrollable(html, 'min-w-[640px]');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test "src/features/reports/components/__tests__/report-delinquency-scroll.test.ts"`
Expected: FAIL because wrappers are not yet applied.

- [ ] **Step 3: Update DelinquencyReportTable**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DelinquencyReportDetails } from './delinquency-report-details';
import { ReportTableWrapper } from './report-table-wrapper';

interface DelinquencySummaryRow {
  memberId: string;
  memberName: string;
  overdueCount: number;
  totalOpenAmount: number;
  oldestDueDate: string;
}

interface DelinquencyDetailRow {
  chargeId: string;
  memberId: string;
  memberName: string;
  chargeTypeName: string;
  dueDate: string;
  openAmount: number;
  daysOverdue: number;
}

interface DelinquencyTotals {
  members: number;
  overdueCharges: number;
  totalOpenAmount: number;
}

interface DelinquencyReportTableProps {
  summaries: DelinquencySummaryRow[];
  details: DelinquencyDetailRow[];
  totals: DelinquencyTotals;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC'
});

export function DelinquencyReportTable({
  summaries,
  details,
  totals
}: DelinquencyReportTableProps) {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const detailsByMember = useMemo(() => {
    return details.reduce(
      (acc, detail) => {
        if (!acc[detail.memberId]) {
          acc[detail.memberId] = [];
        }
        acc[detail.memberId].push(detail);
        return acc;
      },
      {} as Record<string, DelinquencyDetailRow[]>
    );
  }, [details]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatorio de inadimplencia</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-xs'>
              Irmaos inadimplentes
            </div>
            <div className='text-xl font-semibold'>{totals.members}</div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-xs'>
              Cobrancas vencidas
            </div>
            <div className='text-xl font-semibold'>{totals.overdueCharges}</div>
          </div>
          <div className='rounded-md border p-3'>
            <div className='text-muted-foreground text-xs'>Total em aberto</div>
            <div className='text-xl font-semibold'>
              {currencyFormatter.format(totals.totalOpenAmount)}
            </div>
          </div>
        </div>

        <ReportTableWrapper contentClassName='min-w-[680px]'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='px-4 py-2 text-left font-medium'>Irmao</th>
                <th className='px-4 py-2 text-right font-medium'>
                  Qtd. vencidas
                </th>
                <th className='px-4 py-2 text-right font-medium'>
                  Total em aberto
                </th>
                <th className='px-4 py-2 text-left font-medium'>
                  Cobranca mais antiga
                </th>
                <th className='px-4 py-2 text-right font-medium'>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((member) => {
                const isExpanded = expandedMemberId === member.memberId;
                return (
                  <tr key={member.memberId} className='border-t'>
                    <td className='px-4 py-2'>{member.memberName}</td>
                    <td className='px-4 py-2 text-right'>
                      {member.overdueCount}
                    </td>
                    <td className='px-4 py-2 text-right'>
                      {currencyFormatter.format(member.totalOpenAmount)}
                    </td>
                    <td className='px-4 py-2'>
                      {dateFormatter.format(new Date(member.oldestDueDate))}
                    </td>
                    <td className='px-4 py-2 text-right'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          setExpandedMemberId(
                            isExpanded ? null : member.memberId
                          )
                        }
                      >
                        {isExpanded ? 'Ocultar' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {summaries.length === 0 ? (
                <tr className='border-t'>
                  <td
                    colSpan={5}
                    className='text-muted-foreground px-4 py-8 text-center'
                  >
                    Nenhum inadimplente encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </ReportTableWrapper>

        {expandedMemberId ? (
          <DelinquencyReportDetails
            details={detailsByMember[expandedMemberId] || []}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Update DelinquencyReportDetails**

```tsx
import { Badge } from '@/components/ui/badge';
import { ReportTableWrapper } from './report-table-wrapper';

interface DelinquencyDetailRow {
  chargeId: string;
  chargeTypeName: string;
  dueDate: string;
  openAmount: number;
  daysOverdue: number;
}

interface DelinquencyReportDetailsProps {
  details: DelinquencyDetailRow[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC'
});

export function DelinquencyReportDetails({
  details
}: DelinquencyReportDetailsProps) {
  return (
    <ReportTableWrapper contentClassName='min-w-[640px]'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50'>
          <tr>
            <th className='px-3 py-2 text-left font-medium'>
              Tipo de cobranca
            </th>
            <th className='px-3 py-2 text-left font-medium'>Vencimento</th>
            <th className='px-3 py-2 text-right font-medium'>Dias em atraso</th>
            <th className='px-3 py-2 text-right font-medium'>
              Valor em aberto
            </th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail) => (
            <tr key={detail.chargeId} className='border-t'>
              <td className='px-3 py-2'>{detail.chargeTypeName}</td>
              <td className='px-3 py-2'>
                {dateFormatter.format(new Date(detail.dueDate))}
              </td>
              <td className='px-3 py-2 text-right'>
                <Badge variant='outline'>{detail.daysOverdue} dias</Badge>
              </td>
              <td className='px-3 py-2 text-right'>
                {currencyFormatter.format(detail.openAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportTableWrapper>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test "src/features/reports/components/__tests__/report-delinquency-scroll.test.ts"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/reports/components/delinquency-report-table.tsx src/features/reports/components/delinquency-report-details.tsx src/features/reports/components/__tests__/report-delinquency-scroll.test.ts
git commit -m "fix: add horizontal scroll to delinquency tables"
```

---

### Task 4: Aplicar wrapper no grafico “Por tipo de cobranca”

**Files:**

- Modify: `src/features/reports/components/receipts-by-type-chart.tsx`
- Create: `src/features/reports/components/__tests__/report-chart-scroll.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReceiptsByTypeChart } from '../receipts-by-type-chart';

describe('ReceiptsByTypeChart scroll wrapper', () => {
  it('renderiza wrapper para permitir scroll horizontal', () => {
    const html = renderToStaticMarkup(
      React.createElement(ReceiptsByTypeChart, {
        data: [{ chargeTypeName: 'Mensal', total: 120 }]
      })
    );

    assert.ok(html.includes('overflow-x-auto'));
    assert.ok(html.includes('touch-pan-x'));
    assert.ok(html.includes('min-w-[640px]'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test "src/features/reports/components/__tests__/report-chart-scroll.test.ts"`
Expected: FAIL because chart is not wrapped yet.

- [ ] **Step 3: Update ReceiptsByTypeChart**

```tsx
'use client';

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { ReportTableWrapper } from './report-table-wrapper';

interface ReceiptsByTypeItem {
  chargeTypeName: string;
  total: number;
}

interface ReceiptsByTypeChartProps {
  data: ReceiptsByTypeItem[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function ReceiptsByTypeChart({ data }: ReceiptsByTypeChartProps) {
  const chartConfig: ChartConfig = {
    total: {
      label: 'Total'
    }
  };

  const chartData = data.map((item, index) => {
    const configKey = `type${index + 1}`;

    chartConfig[configKey] = {
      label: item.chargeTypeName,
      color: `var(--chart-${(index % 5) + 1})`
    };

    return {
      chargeTypeName: item.chargeTypeName,
      total: item.total,
      fill: `var(--color-${configKey})`
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recebimentos por Tipo de Cobranca</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhum dado encontrado para o periodo.
          </p>
        ) : (
          <ReportTableWrapper contentClassName='min-w-[640px]'>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey='chargeTypeName'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} width={90} />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        currencyFormatter.format(Number(value))
                      }
                    />
                  }
                />
                <Bar dataKey='total' radius={4}>
                  {chartData.map((entry) => (
                    <Cell key={entry.chargeTypeName} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </ReportTableWrapper>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test "src/features/reports/components/__tests__/report-chart-scroll.test.ts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reports/components/receipts-by-type-chart.tsx src/features/reports/components/__tests__/report-chart-scroll.test.ts
git commit -m "fix: wrap receipts chart with horizontal scroll"
```

---

### Task 5: Verificacao manual no mobile

**Files:**

- No code changes.

- [ ] **Step 1: Verificar manualmente no mobile**

Checklist:

- Abrir `/dashboard/reports` no mobile.
- Confirmar scroll horizontal dentro das tabelas de entradas, saidas, posicao dos membros e inadimplencia.
- Confirmar scroll horizontal no grafico “Por tipo de cobranca”.
- Confirmar que desktop permanece inalterado.

---

## Self-Review Checklist

- Spec coverage: wrapper criado e aplicado em todas as tabelas e grafico listados no spec.
- Placeholder scan: nenhum "TODO" ou etapa vaga.
- Consistencia de tipos/nomes: `ReportTableWrapper` usado com `contentClassName` em todos os pontos.
