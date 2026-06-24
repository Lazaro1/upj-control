'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';
import { TransactionStatusBadge } from './transaction-status-badge';

export type PortalTransaction = {
  id: string;
  memberId: string;
  chargeType: {
    id: string;
    name: string;
  } | null;
  competenceDate: string;
  dueDate: string;
  description: string | null;
  amount: number;
  originalAmount: number;
  remainingAmount: number;
  effectiveStatus: string;
  status: string;
  createdAt: string;
  paymentAllocations: {
    id: string;
    allocatedAmount: number;
    payment?: { paymentDate: string; paymentMethod: string | null } | null;
  }[];
};

export const columns: ColumnDef<PortalTransaction>[] = [
  {
    accessorKey: 'chargeType.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Cobrança' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>
          {row.original.chargeType?.name || 'Cobrança Avulsa'}
        </span>
        {row.original.description && (
          <span className='text-xs text-muted-foreground'>
            {row.original.description}
          </span>
        )}
      </div>
    )
  },
  {
    accessorKey: 'competenceDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Competência' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.competenceDate);
      return (
        <span className='capitalize'>
          {format(date, 'MMM/yyyy', { locale: ptBR })}
        </span>
      );
    }
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vencimento' />
    ),
    cell: ({ row }) => format(new Date(row.original.dueDate), 'dd/MM/yyyy')
  },
  {
    id: 'amount',
    accessorKey: 'remainingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor' />
    ),
    cell: ({ row }) => {
      const { remainingAmount, originalAmount, status } = row.original;
      const isOpen = status === 'pendente' || status === 'parcialmente_paga';

      if (isOpen && remainingAmount > 0.01) {
        return (
          <div className='font-semibold'>
            {formatCurrency(remainingAmount)}
            {originalAmount > remainingAmount + 0.01 && (
              <p className='text-xs font-normal text-muted-foreground'>
                de {formatCurrency(originalAmount)}
              </p>
            )}
          </div>
        );
      }

      return <div className='font-semibold'>{formatCurrency(originalAmount)}</div>;
    }
  },
  {
    id: 'status',
    accessorKey: 'effectiveStatus',
    header: 'Situação',
    cell: ({ row }) => <TransactionStatusBadge transaction={row.original} />
  }
];
