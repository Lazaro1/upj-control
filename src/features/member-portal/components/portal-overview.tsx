'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IconAlertCircle, IconArrowUpRight, IconCashBanknote, IconCheck, IconClock, IconCreditCard, IconWallet } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DownloadStatementBtn } from './download-statement-btn';

interface PortalOverviewProps {
  memberId: string;
  data: {
    memberId: string;
    fullName?: string;
    email?: string;
    phone?: string | null;
    creditBalance: number;
    totalDue: number;
    overdueChargesCount: number;
    upcomingCharges: any[];
    overdueCharges: any[];
    lastPayments: any[];
  };
}

export function PortalOverview({ data, memberId }: PortalOverviewProps) {
  const { fullName, email, phone, creditBalance, totalDue, overdueChargesCount, upcomingCharges, overdueCharges, lastPayments } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Síntese Financeira</h2>
          <p className="text-sm text-muted-foreground">{email} {phone ? `• ${phone}` : ''}</p>
        </div>
        <div className="flex space-x-2">
          <DownloadStatementBtn memberId={memberId} type="extrato" />
          <Button variant="outline" asChild>
            <Link href="/dashboard/portal/transactions">Ver Histórico</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Devedor</CardTitle>
            <IconCashBanknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDue)}</div>
            <p className="text-xs text-muted-foreground">
              Total em aberto a pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Credor</CardTitle>
            <IconWallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(creditBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Crédito a seu favor
            </p>
          </CardContent>
        </Card>

        <Card className={overdueChargesCount > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${overdueChargesCount > 0 ? "text-red-600" : ""}`}>
              Pendências
            </CardTitle>
            {overdueChargesCount > 0 ? (
              <IconAlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <IconCheck className="h-4 w-4 text-emerald-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueChargesCount > 0 ? "text-red-700 dark:text-red-400" : ""}`}>
              {overdueChargesCount} vencida(s)
            </div>
            <p className={`text-xs ${overdueChargesCount > 0 ? "text-red-600/80 dark:text-red-400/80" : "text-muted-foreground"}`}>
              {overdueChargesCount > 0 ? "Regularize para evitar transtornos" : "Você está em dia!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
            <CardDescription>Suas cobranças em aberto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overdueCharges.length > 0 && (
              <div className="space-y-4 mb-4">
                <h4 className="text-sm font-semibold text-red-600">Atrasadas</h4>
                {overdueCharges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                        <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{charge.chargeType?.name || charge.description || 'Cobrança'}</span>
                        <span className="text-xs text-red-500">Venceu em {formatDate(new Date(charge.dueDate))}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-red-700 dark:text-red-400">
                      {formatCurrency(charge.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueCharges.length > 0 && upcomingCharges.length > 0 && <Separator />}

            {upcomingCharges.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">A Vencer</h4>
                {upcomingCharges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <IconClock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{charge.chargeType?.name || charge.description || 'Cobrança'}</span>
                        <span className="text-xs text-muted-foreground">Vence em {formatDate(new Date(charge.dueDate))}</span>
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(charge.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueCharges.length === 0 && upcomingCharges.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <IconCheck className="h-8 w-8 text-emerald-500 mb-2" />
                <p>Nenhuma cobrança pendente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription>Seu histórico recente</CardDescription>
          </CardHeader>
          <CardContent>
            {lastPayments.length > 0 ? (
              <div className="space-y-4">
                {lastPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                        <IconArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Pagamento Recebido</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(new Date(payment.paymentDate))} {payment.paymentMethod ? `• ${payment.paymentMethod}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <IconCreditCard className="h-8 w-8 mb-2 opacity-20" />
                <p>Nenhum pagamento registrado recentemente.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
