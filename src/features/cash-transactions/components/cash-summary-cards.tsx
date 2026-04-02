import { Card, CardContent } from '@/components/ui/card';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconScale
} from '@tabler/icons-react';
import { getCashSummary } from '../server/cash-transaction.actions';

interface CashSummaryCardsProps {
  dateFrom?: string;
  dateTo?: string;
}

export async function CashSummaryCards({
  dateFrom,
  dateTo
}: CashSummaryCardsProps) {
  const res = await getCashSummary(dateFrom, dateTo);
  const data =
    res.success && res.data
      ? res.data
      : { totalEntradas: 0, totalSaidas: 0, saldo: 0 };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
      <Card>
        <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
          <div className='rounded-full bg-emerald-500/10 p-3 text-emerald-500'>
            <IconTrendingUp className='h-6 w-6' />
          </div>
          <div className='min-w-0'>
            <p className='text-muted-foreground text-sm font-medium'>
              Total Entradas
            </p>
            <h3 className='truncate text-xl font-bold sm:text-2xl'>
              {formatCurrency(data.totalEntradas)}
            </h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
          <div className='rounded-full bg-red-500/10 p-3 text-red-500'>
            <IconTrendingDown className='h-6 w-6' />
          </div>
          <div className='min-w-0'>
            <p className='text-muted-foreground text-sm font-medium'>
              Total Saídas
            </p>
            <h3 className='truncate text-xl font-bold sm:text-2xl'>
              {formatCurrency(data.totalSaidas)}
            </h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
          <div className='rounded-full bg-blue-500/10 p-3 text-blue-500'>
            <IconScale className='h-6 w-6' />
          </div>
          <div className='min-w-0'>
            <p className='text-muted-foreground text-sm font-medium'>
              Saldo do Período
            </p>
            <h3
              className={`truncate text-xl font-bold sm:text-2xl ${data.saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {formatCurrency(data.saldo)}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
