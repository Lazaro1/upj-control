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
import { cn } from '@/lib/utils';

interface TopOverdueItem {
  memberId: string;
  memberName: string;
  totalOverdue: number;
  overdueCount: number;
  oldestDueDate: string;
  daysOverdue: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pt-BR');

function getDaysOverdueColor(days: number): string {
  if (days > 60) return 'bg-red-100 text-red-700 border-red-200';
  if (days > 30) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-muted text-muted-foreground';
}

export default function DashboardTopOverdue({
  data
}: {
  data: TopOverdueItem[];
}) {
  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Top Inadimplência
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            Nenhuma cobrança em atraso
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Irmão</TableHead>
                  <TableHead className='text-right'>Valor em Atraso</TableHead>
                  <TableHead className='text-right'>Qtd Cobranças</TableHead>
                  <TableHead className='text-right'>Mais Antiga</TableHead>
                  <TableHead className='text-right'>Dias em Atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.memberId}>
                    <TableCell className='font-medium'>
                      {item.memberName}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.totalOverdue)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {item.overdueCount}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatDate(item.oldestDueDate)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Badge
                        variant='outline'
                        className={cn('font-medium', getDaysOverdueColor(item.daysOverdue))}
                      >
                        {item.daysOverdue} dias
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
