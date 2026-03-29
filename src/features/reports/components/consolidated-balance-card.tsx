'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  IconScale,
  IconTrendingDown,
  IconTrendingUp
} from '@tabler/icons-react';

interface ConsolidatedBalanceData {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

interface ConsolidatedBalanceCardProps {
  data: ConsolidatedBalanceData;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function ConsolidatedBalanceCard({
  data
}: ConsolidatedBalanceCardProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      <Card>
        <CardContent className='flex items-center gap-4 p-6'>
          <div className='rounded-full bg-emerald-500/10 p-3 text-emerald-500'>
            <IconTrendingUp className='h-6 w-6' />
          </div>
          <div>
            <p className='text-muted-foreground text-sm font-medium'>
              Total Entradas
            </p>
            <h3 className='text-2xl font-bold'>
              {currencyFormatter.format(data.totalEntradas)}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='flex items-center gap-4 p-6'>
          <div className='rounded-full bg-red-500/10 p-3 text-red-500'>
            <IconTrendingDown className='h-6 w-6' />
          </div>
          <div>
            <p className='text-muted-foreground text-sm font-medium'>
              Total Saídas
            </p>
            <h3 className='text-2xl font-bold'>
              {currencyFormatter.format(data.totalSaidas)}
            </h3>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='flex items-center gap-4 p-6'>
          <div className='rounded-full bg-blue-500/10 p-3 text-blue-500'>
            <IconScale className='h-6 w-6' />
          </div>
          <div>
            <p className='text-muted-foreground text-sm font-medium'>
              Saldo do Período
            </p>
            <h3
              className={`text-2xl font-bold ${data.saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
            >
              {currencyFormatter.format(data.saldo)}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
