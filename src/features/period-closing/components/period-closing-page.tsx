'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  IconLock,
  IconLockOpen,
  IconCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconScale,
  IconReceipt,
  IconCashRegister,
  IconArrowUp,
  IconArrowDown
} from '@tabler/icons-react';
import {
  getPeriodSummary,
  getPeriodStatus,
  closePeriod,
  reopenPeriod,
  listPeriodClosings,
  type PeriodClosingListItem,
  type PeriodClosingSummary
} from '@/features/period-closing/server/period-closing.actions';

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface PeriodClosingPageProps {
  initialClosings: PeriodClosingListItem[];
  initialPagination: {
    page: number;
    perPage: number;
    total: number;
    pageCount: number;
  };
  orgRole: string | undefined;
}

export function PeriodClosingPage({
  initialClosings,
  initialPagination,
  orgRole
}: PeriodClosingPageProps) {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [summary, setSummary] = useState<PeriodClosingSummary | null>(null);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [closingData, setClosingData] = useState<PeriodClosingListItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [closings, setClosings] =
    useState<PeriodClosingListItem[]>(initialClosings);
  const [pagination, setPagination] = useState(initialPagination);
  const [tableLoading, setTableLoading] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const form = useForm<{ notes: string }>({
    defaultValues: { notes: '' }
  });

  const loadPeriodData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, statusRes] = await Promise.all([
        getPeriodSummary(month, year),
        getPeriodStatus(month, year)
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setSummary(null);
        setError(summaryRes.error || 'Erro ao carregar resumo do período.');
      }

      if (statusRes.success) {
        setIsClosed(!!statusRes.closed);
        setClosingData(statusRes.closingData || null);
      } else {
        setIsClosed(false);
        setClosingData(null);
        setError(statusRes.error || 'Erro ao verificar status do período.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadPeriodData();
  }, [loadPeriodData]);

  async function loadClosings(page = pagination.page) {
    setTableLoading(true);
    try {
      const res = await listPeriodClosings(page, pagination.perPage);
      if (res.success && res.data) {
        setClosings(res.data);
        setPagination({
          page,
          perPage: pagination.perPage,
          total: res.total ?? 0,
          pageCount: res.pageCount ?? 1
        });
      } else {
        toast.error(res.error || 'Erro ao carregar histórico de fechamentos.');
      }
    } finally {
      setTableLoading(false);
    }
  }

  async function handleClosePeriod(data: { notes: string }) {
    const res = await closePeriod({
      competenceMonth: month,
      competenceYear: year,
      notes: data.notes
    });

    if (res.success) {
      toast.success('Período encerrado com sucesso!');
      setCloseDialogOpen(false);
      form.reset();
      await loadPeriodData();
      await loadClosings(1);
    } else {
      toast.error(res.error || 'Erro ao encerrar período.');
    }
  }

  async function handleReopenPeriod() {
    setIsReopening(true);
    try {
      const res = await reopenPeriod({
        competenceMonth: month,
        competenceYear: year
      });

      if (res.success) {
        toast.success('Período reaberto com sucesso!');
        setReopenDialogOpen(false);
        await loadPeriodData();
        await loadClosings(1);
      } else {
        toast.error(res.error || 'Erro ao reabrir período.');
      }
    } finally {
      setIsReopening(false);
    }
  }

  const isAdmin = orgRole === 'org:admin';
  const selectedMonthLabel = MONTHS.find((m) => m.value === month)?.label ?? '';

  return (
    <div className='space-y-8'>
      {/* Period Selection */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Mês</label>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Selecione o mês' />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Ano</label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Ano' />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
          <IconAlertTriangle className='h-5 w-5 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Status Banner */}
      {isClosed && closingData && (
        <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          <IconLock className='h-5 w-5 shrink-0' />
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='secondary'
              className='bg-amber-100 text-amber-800 hover:bg-amber-100'
            >
              Período Encerrado
            </Badge>
            <span className='text-amber-700'>
              Encerrado em {formatDate(closingData.closedAt)} por{' '}
              {closingData.closedBy || 'Não identificado'}
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='bg-muted h-12 w-12 shrink-0 rounded-full' />
                <div className='min-w-0 space-y-2'>
                  <div className='bg-muted h-4 w-24 rounded' />
                  <div className='bg-muted h-6 w-32 rounded' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Prévia do Período</h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Total Cobrado */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-500/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-emerald-500/10 p-3 text-emerald-500'>
                  <IconTrendingUp className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Total Cobrado
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {formatCurrency(summary.totalCharged)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Total Recebido */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-500/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-blue-500/10 p-3 text-blue-500'>
                  <IconTrendingDown className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Total Recebido
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {formatCurrency(summary.totalReceived)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Saldo */}
            <Card className='relative overflow-hidden'>
              <div
                className={cn(
                  'absolute top-0 left-0 h-1 w-full bg-gradient-to-r',
                  summary.balance >= 0
                    ? 'from-emerald-500 to-emerald-500/40'
                    : 'from-red-500 to-red-500/40'
                )}
              />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div
                  className={cn(
                    'rounded-full p-3',
                    summary.balance >= 0
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  )}
                >
                  <IconScale className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Saldo
                  </p>
                  <h3
                    className={cn(
                      'truncate text-xl font-bold sm:text-2xl',
                      summary.balance >= 0
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    )}
                  >
                    {formatCurrency(summary.balance)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Nº Cobranças */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-primary/10 p-3 text-primary'>
                  <IconReceipt className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Nº Cobranças
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {summary.totalCharges}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Nº Pagamentos */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-primary/10 p-3 text-primary'>
                  <IconCashRegister className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Nº Pagamentos
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {summary.totalPayments}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Entradas Caixa */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-500/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-emerald-500/10 p-3 text-emerald-500'>
                  <IconArrowUp className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Entradas Caixa
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {formatCurrency(summary.totalCashIn)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Saídas Caixa */}
            <Card className='relative overflow-hidden'>
              <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-red-500/40' />
              <CardContent className='flex items-center gap-4 p-4 sm:p-6'>
                <div className='rounded-full bg-red-500/10 p-3 text-red-500'>
                  <IconArrowDown className='h-6 w-6' />
                </div>
                <div className='min-w-0'>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Saídas Caixa
                  </p>
                  <h3 className='truncate text-xl font-bold sm:text-2xl'>
                    {formatCurrency(summary.totalCashOut)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3'>
            {!isClosed ? (
              <AlertDialog
                open={closeDialogOpen}
                onOpenChange={setCloseDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button className='gap-2'>
                    <IconLock className='h-4 w-4' />
                    Encerrar Período
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Fechamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a encerrar o período{' '}
                      <strong>
                        {selectedMonthLabel} {year}
                      </strong>
                      . Após o encerramento, não será possível alterar dados
                      deste período.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {summary && (
                    <div className='grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm'>
                      <div>
                        <p className='text-muted-foreground'>Total Cobrado</p>
                        <p className='font-semibold'>
                          {formatCurrency(summary.totalCharged)}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Total Recebido</p>
                        <p className='font-semibold'>
                          {formatCurrency(summary.totalReceived)}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Saldo</p>
                        <p
                          className={cn(
                            'font-semibold',
                            summary.balance >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          )}
                        >
                          {formatCurrency(summary.balance)}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Nº Cobranças</p>
                        <p className='font-semibold'>{summary.totalCharges}</p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={form.handleSubmit(handleClosePeriod)}
                    className='space-y-3'
                  >
                    <div>
                      <label className='text-sm font-medium'>
                        Observações (opcional)
                      </label>
                      <Textarea
                        placeholder='Adicione notas sobre este fechamento...'
                        className='mt-1.5 resize-none'
                        {...form.register('notes')}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        type='button'
                        onClick={() => setCloseDialogOpen(false)}
                      >
                        Cancelar
                      </AlertDialogCancel>
                      <Button
                        type='submit'
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                            Encerrando...
                          </>
                        ) : (
                          <>
                            <IconCheck className='mr-2 h-4 w-4' />
                            Confirmar Encerramento
                          </>
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}

            {isClosed && isAdmin ? (
              <AlertDialog
                open={reopenDialogOpen}
                onOpenChange={setReopenDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='gap-2'>
                    <IconLockOpen className='h-4 w-4' />
                    Reabrir Período
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
                      <IconAlertTriangle className='h-5 w-5' />
                      Reabrir Período
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja reabrir o período{' '}
                      <strong>
                        {selectedMonthLabel} {year}
                      </strong>
                      ? Esta ação removerá o bloqueio de alterações e poderá
                      afetar a consistência dos dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setReopenDialogOpen(false)}
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <Button
                      variant='destructive'
                      disabled={isReopening}
                      onClick={() => void handleReopenPeriod()}
                    >
                      {isReopening ? (
                        <>
                          <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                          Reabrindo...
                        </>
                      ) : (
                        <>
                          <IconLockOpen className='mr-2 h-4 w-4' />
                          Reabrir
                        </>
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </div>
      ) : !isLoading && !error ? (
        <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
          Selecione um período para visualizar a prévia.
        </div>
      ) : null}

      {/* Closed Periods Table */}
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Histórico de Fechamentos</h2>
        <div className='overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Total Cobrado</TableHead>
                <TableHead>Total Recebido</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Encerrado por</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    <Icons.spinner className='text-muted-foreground mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : closings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-muted-foreground h-24 text-center'
                  >
                    Nenhum período encerrado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                closings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {String(item.competenceMonth).padStart(2, '0')}/
                      {item.competenceYear}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.totalCharged)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.totalReceived)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          item.balance >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        )}
                      >
                        {formatCurrency(item.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.closedBy || 'Não identificado'}
                    </TableCell>
                    <TableCell>{formatDate(item.closedAt)}</TableCell>
                    <TableCell className='max-w-[200px] truncate'>
                      {item.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.pageCount > 1 && (
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-sm'>
              Página {pagination.page} de {pagination.pageCount} (
              {pagination.total} total)
            </p>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                disabled={pagination.page <= 1 || tableLoading}
                onClick={() => void loadClosings(pagination.page - 1)}
              >
                Anterior
              </Button>
              <Button
                size='sm'
                variant='outline'
                disabled={
                  pagination.page >= pagination.pageCount || tableLoading
                }
                onClick={() => void loadClosings(pagination.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
