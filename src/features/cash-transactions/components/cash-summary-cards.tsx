import { Card, CardContent } from '@/components/ui/card';
import { IconTrendingUp, IconTrendingDown, IconScale } from '@tabler/icons-react';
import { getCashSummary } from '../server/cash-transaction.actions';

interface CashSummaryCardsProps {
  dateFrom?: string;
  dateTo?: string;
}

export async function CashSummaryCards({ dateFrom, dateTo }: CashSummaryCardsProps) {
  const res = await getCashSummary(dateFrom, dateTo);
  const data = res.success && res.data ? res.data : { totalEntradas: 0, totalSaidas: 0, saldo: 0 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-8'>
      <Card>
        <CardContent className='p-6 flex items-center gap-4'>
          <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-full'>
            <IconTrendingUp className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>Total Entradas</p>
            <h3 className='text-2xl font-bold'>{formatCurrency(data.totalEntradas)}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='p-6 flex items-center gap-4'>
          <div className='p-3 bg-red-500/10 text-red-500 rounded-full'>
            <IconTrendingDown className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>Total Saídas</p>
            <h3 className='text-2xl font-bold'>{formatCurrency(data.totalSaidas)}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='p-6 flex items-center gap-4'>
          <div className='p-3 bg-blue-500/10 text-blue-500 rounded-full'>
            <IconScale className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm text-muted-foreground font-medium'>Saldo do Período</p>
            <h3 className={`text-2xl font-bold ${data.saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(data.saldo)}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
