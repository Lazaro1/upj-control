'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Composição por Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='45%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey='total'
                nameKey='method'
                label={({ method, percent }) =>
                  `${method}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pleasantPalette[index % pleasantPalette.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    return (
                      <div className='rounded-lg border bg-background p-3 shadow-sm'>
                        <p className='text-sm font-medium'>
                          {entry.payload.method}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {formatCurrency(entry.value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                iconType='circle'
                formatter={(value: string) => (
                  <span className='text-sm text-muted-foreground'>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
