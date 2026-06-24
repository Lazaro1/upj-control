'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyOverduePoint {
  month: string;
  overdueAmount: number;
  overdueCount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

export default function DashboardOverdueChart({
  data
}: {
  data: MonthlyOverduePoint[];
}) {
  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Evolução da Inadimplência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  }).format(value)
                }
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    return (
                      <div className='rounded-lg border bg-background p-3 shadow-sm'>
                        <p className='text-sm font-medium'>
                          {entry.payload.month}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Valor: {formatCurrency(entry.value as number)}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Cobranças: {entry.payload.overdueCount}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='overdueAmount'
                fill='#ef4444'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
