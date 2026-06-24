'use client';

import type { Table as TanstackTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PortalTransaction } from './columns';
import { TransactionStatusBadge } from './transaction-status-badge';

interface PortalTransactionsMobileListProps {
  table: TanstackTable<PortalTransaction>;
}

export function PortalTransactionsMobileList({
  table
}: PortalTransactionsMobileListProps) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className='rounded-lg border py-12 text-center text-sm text-muted-foreground'>
        Nenhum lançamento encontrado.
      </div>
    );
  }

  return (
    <div className='space-y-3 md:hidden'>
      {rows.map((row) => {
        const item = row.original;
        const competenceDate = new Date(item.competenceDate);
        const dueDate = new Date(item.dueDate);
        const isOpen =
          item.remainingAmount > 0.01 &&
          (item.status === 'pendente' || item.status === 'parcialmente_paga');
        const isOverdue = item.effectiveStatus === 'vencido';

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-lg border p-4',
              isOverdue && 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20'
            )}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold'>
                  {item.chargeType?.name || 'Cobrança Avulsa'}
                </p>
                {item.description && (
                  <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {item.description}
                  </p>
                )}
              </div>
              <TransactionStatusBadge transaction={item} />
            </div>

            <div className='mt-3 flex items-end justify-between gap-3'>
              <div className='text-xs text-muted-foreground'>
                <p className='capitalize'>
                  Competência: {format(competenceDate, 'MMM/yyyy', { locale: ptBR })}
                </p>
                <p>Vencimento: {format(dueDate, 'dd/MM/yyyy')}</p>
              </div>
              <div className='text-right'>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isOpen && isOverdue && 'text-red-700 dark:text-red-400',
                    item.status === 'paga' && 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  {isOpen
                    ? formatCurrency(item.remainingAmount)
                    : formatCurrency(item.originalAmount)}
                </p>
                {isOpen && item.originalAmount > item.remainingAmount + 0.01 && (
                  <p className='text-xs text-muted-foreground'>
                    de {formatCurrency(item.originalAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
