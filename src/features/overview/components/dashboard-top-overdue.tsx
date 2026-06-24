import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDbDate } from '@/lib/delinquency';
import { cn } from '@/lib/utils';
import type { TopOverdueData } from '@/features/overview/server/dashboard.actions';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

function getDaysOverdueColor(days: number): string {
  if (days > 60) return 'bg-red-100 text-red-700 border-red-200';
  if (days > 30) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-muted text-muted-foreground';
}

function buildSummaryLabel(totals: TopOverdueData['totals']): string {
  const { memberCount, chargeCount, totalOpenAmount } = totals;

  if (memberCount === 0) {
    return 'Nenhuma cobrança vencida em aberto';
  }

  const membersLabel = memberCount === 1 ? '1 irmão' : `${memberCount} irmãos`;
  const chargesLabel =
    chargeCount === 1 ? '1 cobrança' : `${chargeCount} cobranças`;

  return `${membersLabel} · ${chargesLabel} · ${formatCurrency(totalOpenAmount)} em aberto`;
}

export default function DashboardTopOverdue({
  data
}: {
  data: TopOverdueData;
}) {
  const { items, totals } = data;

  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-500/40' />
      <CardHeader className='space-y-1 pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Top Inadimplência
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          {buildSummaryLabel(totals)}
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            Nenhuma cobrança em atraso
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Irmão</TableHead>
                  <TableHead className='text-right'>Valor em Aberto</TableHead>
                  <TableHead className='hidden text-right sm:table-cell'>
                    Qtd Cobranças
                  </TableHead>
                  <TableHead className='hidden text-right md:table-cell'>
                    Mais Antiga
                  </TableHead>
                  <TableHead className='text-right'>Dias em Atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.memberId}>
                    <TableCell className='font-medium'>
                      <Link
                        href={`/dashboard/members/${item.memberId}`}
                        className='hover:text-primary hover:underline'
                      >
                        {item.memberName}
                      </Link>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(item.totalOverdue)}
                    </TableCell>
                    <TableCell className='hidden text-right sm:table-cell'>
                      {item.overdueCount}
                    </TableCell>
                    <TableCell className='hidden text-right md:table-cell'>
                      {formatDbDate(item.oldestDueDate)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'font-medium',
                          getDaysOverdueColor(item.daysOverdue)
                        )}
                      >
                        {item.daysOverdue} dias
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totals.memberCount > items.length && (
              <p className='text-muted-foreground mt-3 text-xs'>
                Exibindo os {items.length} maiores devedores por valor em
                aberto.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
