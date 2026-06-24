'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import {
  IconAlertCircle,
  IconArrowUpRight,
  IconCashBanknote,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconWallet
} from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';

interface PortalCharge {
  id: string;
  amount: number;
  originalAmount?: number;
  dueDate: string | Date;
  description?: string | null;
  chargeType?: { name: string } | null;
}

interface PortalPayment {
  id: string;
  amount: number;
  paymentDate: string | Date;
  paymentMethod?: string | null;
}

interface PortalOverviewProps {
  data: {
    memberId: string;
    fullName?: string;
    email?: string;
    phone?: string | null;
    creditBalance: number;
    totalDue: number;
    overdueChargesCount: number;
    upcomingCharges: PortalCharge[];
    overdueCharges: PortalCharge[];
    lastPayments: PortalPayment[];
  };
}

export function PortalOverview({ data }: PortalOverviewProps) {
  const {
    creditBalance,
    totalDue,
    overdueChargesCount,
    upcomingCharges,
    overdueCharges,
    lastPayments
  } = data;

  return (
    <div className='space-y-6 pb-8'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Saldo Devedor
            </CardTitle>
            <IconCashBanknote className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold'>{formatCurrency(totalDue)}</div>
            <p className='text-xs text-muted-foreground'>Total em aberto a pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Saldo Credor
            </CardTitle>
            <IconWallet className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold text-emerald-600'>
              {formatCurrency(creditBalance)}
            </div>
            <p className='text-xs text-muted-foreground'>Crédito a seu favor</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            overdueChargesCount > 0 && 'border-red-200 bg-red-50 dark:bg-red-950/20'
          )}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle
              className={cn(
                'text-sm font-medium text-muted-foreground',
                overdueChargesCount > 0 && 'text-red-600'
              )}
            >
              Pendências
            </CardTitle>
            {overdueChargesCount > 0 ? (
              <IconAlertCircle className='h-4 w-4 text-red-600' />
            ) : (
              <IconCheck className='h-4 w-4 text-emerald-500' />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-xl font-bold',
                overdueChargesCount > 0 && 'text-red-700 dark:text-red-400'
              )}
            >
              {overdueChargesCount} vencida(s)
            </div>
            <p
              className={cn(
                'text-xs',
                overdueChargesCount > 0
                  ? 'text-red-600/80 dark:text-red-400/80'
                  : 'text-muted-foreground'
              )}
            >
              {overdueChargesCount > 0
                ? 'Regularize para evitar transtornos'
                : 'Você está em dia!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>Próximos Vencimentos</CardTitle>
            <CardDescription>Suas cobranças em aberto</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {overdueCharges.length > 0 && (
              <div className='mb-4 space-y-4'>
                <h4 className='text-sm font-semibold text-red-600'>Atrasadas</h4>
                {overdueCharges.map((charge) => (
                  <div
                    key={charge.id}
                    className='flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/30 dark:bg-red-900/10'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='shrink-0 rounded-full bg-red-100 p-2 dark:bg-red-900/50'>
                        <IconAlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
                      </div>
                      <div className='min-w-0 flex flex-col'>
                        <span className='truncate text-sm font-medium'>
                          {charge.chargeType?.name || charge.description || 'Cobrança'}
                        </span>
                        <span className='text-xs text-red-500'>
                          Venceu em {formatDate(new Date(charge.dueDate))}
                        </span>
                      </div>
                    </div>
                    <div className='text-sm font-semibold text-red-700 sm:text-right dark:text-red-400'>
                      {formatCurrency(charge.amount)}
                      {charge.originalAmount &&
                        charge.originalAmount > charge.amount + 0.01 && (
                          <span className='mt-0.5 block text-xs font-normal text-muted-foreground'>
                            de {formatCurrency(charge.originalAmount)}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueCharges.length > 0 && upcomingCharges.length > 0 && <Separator />}

            {upcomingCharges.length > 0 && (
              <div className='space-y-4'>
                <h4 className='text-sm font-medium text-muted-foreground'>A Vencer</h4>
                {upcomingCharges.map((charge) => (
                  <div
                    key={charge.id}
                    className='flex flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='shrink-0 rounded-full bg-primary/10 p-2'>
                        <IconClock className='h-4 w-4 text-primary' />
                      </div>
                      <div className='min-w-0 flex flex-col'>
                        <span className='truncate text-sm font-medium'>
                          {charge.chargeType?.name || charge.description || 'Cobrança'}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          Vence em {formatDate(new Date(charge.dueDate))}
                        </span>
                      </div>
                    </div>
                    <div className='text-sm font-semibold sm:text-right'>
                      {formatCurrency(charge.amount)}
                      {charge.originalAmount &&
                        charge.originalAmount > charge.amount + 0.01 && (
                          <span className='mt-0.5 block text-xs font-normal text-muted-foreground'>
                            de {formatCurrency(charge.originalAmount)}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueCharges.length === 0 && upcomingCharges.length === 0 && (
              <div className='flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground'>
                <IconCheck className='mb-2 h-8 w-8 text-emerald-500' />
                <p>Nenhuma cobrança pendente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>Últimos Pagamentos</CardTitle>
            <CardDescription>Seu histórico recente</CardDescription>
          </CardHeader>
          <CardContent>
            {lastPayments.length > 0 ? (
              <div className='space-y-4'>
                {lastPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className='flex flex-col gap-2 border-b py-2 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='shrink-0 rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30'>
                        <IconArrowUpRight className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                      </div>
                      <div className='min-w-0 flex flex-col'>
                        <span className='text-sm font-medium'>Pagamento Recebido</span>
                        <span className='text-xs text-muted-foreground'>
                          {formatDate(new Date(payment.paymentDate))}
                          {payment.paymentMethod ? ` • ${payment.paymentMethod}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className='text-sm font-semibold text-emerald-600 sm:text-right dark:text-emerald-400'>
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground'>
                <IconCreditCard className='mb-2 h-8 w-8 opacity-20' />
                <p>Nenhum pagamento registrado recentemente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
