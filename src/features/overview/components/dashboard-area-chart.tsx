'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MonthlyDataPoint {
  month: string;
  revenue: number;
  charged: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

export default function DashboardAreaChart({
  data
}: {
  data: MonthlyDataPoint[];
}) {
  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Evolução Receita x Cobranças
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorCharged' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
              </defs>
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='rounded-lg border bg-background p-3 shadow-sm'>
                        <p className='mb-1 text-sm font-medium'>{label}</p>
                        {payload.map((entry, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-2 text-sm'
                          >
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className='text-muted-foreground'>
                              {entry.name === 'revenue'
                                ? 'Receita'
                                : 'Cobrado'}
                              :
                            </span>
                            <span className='font-medium'>
                              {formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type='monotone'
                dataKey='revenue'
                name='revenue'
                stroke='#10b981'
                strokeWidth={2}
                fill='url(#colorRevenue)'
              />
              <Area
                type='monotone'
                dataKey='charged'
                name='charged'
                stroke='#3b82f6'
                strokeWidth={2}
                fill='url(#colorCharged)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
