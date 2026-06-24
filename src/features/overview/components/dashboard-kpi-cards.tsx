import {
  IconAlertTriangle,
  IconCheck,
  IconReceipt,
  IconScale,
  IconTrendingDown,
  IconTrendingUp,
  IconUsersGroup
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICard {
  label: string;
  value: number;
  formattedValue: string;
  variation: number | null;
  variationLabel: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

interface DashboardKPIs {
  revenue: KPICard;
  charged: KPICard;
  overdue: KPICard;
  cashBalance: KPICard;
  complianceRate: KPICard;
  activeMembers: KPICard;
}

const iconMap: Record<string, React.ElementType> = {
  trendingUp: IconTrendingUp,
  receipt: IconReceipt,
  alertTriangle: IconAlertTriangle,
  scale: IconScale,
  check: IconCheck,
  usersGroup: IconUsersGroup
};

const kpiConfig: Record<
  string,
  { color: string; gradient: string; label: string }
> = {
  revenue: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-500/40',
    label: 'Receita'
  },
  charged: {
    color: 'blue',
    gradient: 'from-blue-500 to-blue-500/40',
    label: 'Cobrado'
  },
  overdue: {
    color: 'red',
    gradient: 'from-red-500 to-red-500/40',
    label: 'Inadimplência'
  },
  cashBalance: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-500/40',
    label: 'Saldo em Caixa'
  },
  complianceRate: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-500/40',
    label: 'Taxa de Adimplência'
  },
  activeMembers: {
    color: 'primary',
    gradient: 'from-primary to-primary/40',
    label: 'Membros Ativos'
  }
};

function getCashBalanceColor(value: number) {
  return value >= 0 ? 'emerald' : 'red';
}

function getComplianceColor(value: number) {
  if (value >= 70) return 'emerald';
  if (value >= 50) return 'amber';
  return 'red';
}

function getCardColor(key: string, kpi: KPICard): string {
  if (key === 'cashBalance') {
    return getCashBalanceColor(kpi.value);
  }
  if (key === 'complianceRate') {
    return getComplianceColor(kpi.value);
  }
  return kpiConfig[key]?.color || 'primary';
}

function colorClass(color: string, suffix: string): string {
  const map: Record<string, string> = {
    'emerald-bg': 'bg-emerald-500/10',
    'emerald-text': 'text-emerald-500',
    'emerald-gradient': 'from-emerald-500 to-emerald-500/40',
    'blue-bg': 'bg-blue-500/10',
    'blue-text': 'text-blue-500',
    'blue-gradient': 'from-blue-500 to-blue-500/40',
    'red-bg': 'bg-red-500/10',
    'red-text': 'text-red-500',
    'red-gradient': 'from-red-500 to-red-500/40',
    'amber-bg': 'bg-amber-500/10',
    'amber-text': 'text-amber-500',
    'amber-gradient': 'from-amber-500 to-amber-500/40',
    'primary-bg': 'bg-primary/10',
    'primary-text': 'text-primary',
    'primary-gradient': 'from-primary to-primary/40'
  };
  return map[`${color}-${suffix}`] || '';
}

export default function DashboardKPICards({ data }: { data: DashboardKPIs }) {
  const entries = Object.entries(data) as [string, KPICard][];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {entries.map(([key, kpi]) => {
        const color = getCardColor(key, kpi);
        const Icon = iconMap[kpi.icon] || IconTrendingUp;
        const isPositiveTrend = kpi.trend === 'up';

        return (
          <Card key={key} className='relative overflow-hidden'>
            <div
              className={cn(
                'absolute top-0 left-0 h-1 w-full bg-gradient-to-r',
                colorClass(color, 'gradient')
              )}
            />
            <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
              <div
                className={cn(
                  'rounded-full p-3',
                  colorClass(color, 'bg'),
                  colorClass(color, 'text')
                )}
              >
                <Icon className='h-6 w-6' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  {kpi.label}
                </p>
                <h3 className='truncate text-xl font-bold sm:text-2xl'>
                  {kpi.formattedValue}
                </h3>
                {kpi.variation !== null && (
                  <div className='mt-1 flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'gap-1 text-xs',
                        isPositiveTrend
                          ? 'border-emerald-200 text-emerald-600'
                          : 'border-red-200 text-red-600'
                      )}
                    >
                      {isPositiveTrend ? (
                        <IconTrendingUp className='h-3 w-3' />
                      ) : (
                        <IconTrendingDown className='h-3 w-3' />
                      )}
                      {kpi.variation > 0 ? '+' : ''}
                      {kpi.variation.toFixed(1)}%
                    </Badge>
                  </div>
                )}
                <p className='text-muted-foreground mt-1 text-xs'>
                  {kpi.variationLabel}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
