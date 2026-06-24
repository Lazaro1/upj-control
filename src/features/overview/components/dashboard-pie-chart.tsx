'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPaymentMethod } from '@/lib/payment-methods';

interface PaymentMethodBreakdown {
  method: string;
  total: number;
}

const pleasantPalette = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16'
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

export default function DashboardPieChart({
  data
}: {
  data: PaymentMethodBreakdown[];
}) {
  const chartData = data.map((item, index) => ({
    ...item,
    label: formatPaymentMethod(item.method),
    color: pleasantPalette[index % pleasantPalette.length]
  }));

  const total = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Composição por Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground py-16 text-center text-sm'>
            Nenhum pagamento registrado neste período
          </p>
        ) : (
          <>
            <div className='h-[220px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey='total'
                    nameKey='label'
                    stroke='none'
                  >
                    {chartData.map((item) => (
                      <Cell key={item.method} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0]
                          .payload as (typeof chartData)[0];
                        const percent =
                          total > 0
                            ? ((entry.total / total) * 100).toFixed(0)
                            : '0';
                        return (
                          <div className='bg-background rounded-lg border p-3 shadow-sm'>
                            <p className='text-sm font-medium'>{entry.label}</p>
                            <p className='text-muted-foreground text-sm'>
                              {formatCurrency(entry.total)} ({percent}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-2 space-y-2 border-t pt-3'>
              {chartData.map((item) => {
                const percent =
                  total > 0 ? ((item.total / total) * 100).toFixed(0) : '0';
                return (
                  <div
                    key={item.method}
                    className='flex items-start justify-between gap-3 text-sm'
                  >
                    <div className='flex min-w-0 items-center gap-2'>
                      <span
                        className='mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <span className='leading-snug font-medium'>
                        {item.label}
                      </span>
                    </div>
                    <div className='text-muted-foreground shrink-0 text-right leading-snug'>
                      <div>{formatCurrency(item.total)}</div>
                      <div className='text-xs'>{percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
