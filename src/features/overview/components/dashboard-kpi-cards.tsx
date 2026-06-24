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
import type {
  DashboardKPIs,
  KPICard,
  KPIVariationUnit
} from '@/features/overview/server/dashboard.actions';

const iconMap: Record<string, React.ElementType> = {
  trendingUp: IconTrendingUp,
  receipt: IconReceipt,
  alertTriangle: IconAlertTriangle,
  scale: IconScale,
  check: IconCheck,
  usersGroup: IconUsersGroup
};

const kpiSections: {
  title: string;
  keys: (keyof DashboardKPIs)[];
}[] = [
  {
    title: 'Resumo financeiro',
    keys: ['revenue', 'charged', 'cashBalance']
  },
  {
    title: 'Inadimplência e membros',
    keys: ['overdue', 'complianceRate', 'activeMembers']
  }
];

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

  const defaults: Record<string, string> = {
    revenue: 'emerald',
    charged: 'blue',
    overdue: 'red',
    activeMembers: 'primary'
  };

  return defaults[key] || 'primary';
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

function formatVariation(variation: number, unit: KPIVariationUnit): string {
  const sign = variation > 0 ? '+' : '';

  if (unit === 'percentagePoints') {
    return `${sign}${variation.toFixed(1)} p.p.`;
  }

  if (unit === 'absolute') {
    return `${sign}${variation}`;
  }

  return `${sign}${variation.toFixed(1)}%`;
}

function isTrendPositive(kpi: KPICard): boolean {
  if (kpi.trend === 'neutral') return true;
  const isUp = kpi.trend === 'up';
  return kpi.positiveIsGood ? isUp : !isUp;
}

interface KPICardItemProps {
  cardKey: string;
  kpi: KPICard;
}

function KPICardItem({ cardKey, kpi }: KPICardItemProps) {
  const color = getCardColor(cardKey, kpi);
  const Icon = iconMap[kpi.icon] || IconTrendingUp;
  const trendIsPositive = isTrendPositive(kpi);
  const valueUsesColor =
    cardKey === 'cashBalance' || cardKey === 'complianceRate';

  return (
    <Card className='relative h-full overflow-hidden'>
      <div
        className={cn(
          'absolute top-0 left-0 h-1 w-full bg-gradient-to-r',
          colorClass(color, 'gradient')
        )}
      />
      <CardContent className='flex h-full items-start gap-4 p-4 sm:p-5'>
        <div
          className={cn(
            'shrink-0 rounded-full p-3',
            colorClass(color, 'bg'),
            colorClass(color, 'text')
          )}
        >
          <Icon className='h-5 w-5 sm:h-6 sm:w-6' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='text-muted-foreground text-sm font-medium'>
            {kpi.label}
          </p>
          <h3
            className={cn(
              'truncate text-xl font-bold sm:text-2xl',
              valueUsesColor && colorClass(color, 'text')
            )}
          >
            {kpi.formattedValue}
          </h3>
          {kpi.variation !== null && (
            <Badge
              variant='outline'
              className={cn(
                'mt-1 w-fit gap-1 text-xs',
                trendIsPositive
                  ? 'border-emerald-200 text-emerald-600'
                  : 'border-red-200 text-red-600'
              )}
            >
              {kpi.trend === 'up' ? (
                <IconTrendingUp className='h-3 w-3' />
              ) : kpi.trend === 'down' ? (
                <IconTrendingDown className='h-3 w-3' />
              ) : null}
              {formatVariation(kpi.variation, kpi.variationUnit)}
            </Badge>
          )}
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {kpi.variationLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardKPICards({ data }: { data: DashboardKPIs }) {
  return (
    <div className='space-y-5'>
      {kpiSections.map((section) => (
        <section key={section.title}>
          <h2 className='text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase'>
            {section.title}
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {section.keys.map((key) => (
              <KPICardItem key={key} cardKey={key} kpi={data[key]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
