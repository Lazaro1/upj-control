'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DelinquencyReportDetails } from './delinquency-report-details';

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

        <div className='overflow-x-auto rounded-md border'>
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
        </div>

        {expandedMemberId ? (
          <DelinquencyReportDetails
            details={detailsByMember[expandedMemberId] || []}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
