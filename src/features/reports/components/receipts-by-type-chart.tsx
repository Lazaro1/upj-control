'use client';

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface ReceiptsByTypeItem {
  chargeTypeName: string;
  total: number;
}

interface ReceiptsByTypeChartProps {
  data: ReceiptsByTypeItem[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function ReceiptsByTypeChart({ data }: ReceiptsByTypeChartProps) {
  const chartConfig: ChartConfig = {
    total: {
      label: 'Total'
    }
  };

  const chartData = data.map((item, index) => {
    const configKey = `type${index + 1}`;

    chartConfig[configKey] = {
      label: item.chargeTypeName,
      color: `var(--chart-${(index % 5) + 1})`
    };

    return {
      chargeTypeName: item.chargeTypeName,
      total: item.total,
      fill: `var(--color-${configKey})`
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recebimentos por Tipo de Cobrança</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhum dado encontrado para o período.
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <XAxis
                dataKey='chargeTypeName'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} width={90} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      currencyFormatter.format(Number(value))
                    }
                  />
                }
              />
              <Bar dataKey='total' radius={4}>
                {chartData.map((entry) => (
                  <Cell key={entry.chargeTypeName} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
