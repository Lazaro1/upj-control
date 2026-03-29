'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { format } from 'date-fns';

export type CashTransactionSerializable = {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  transactionDate: string;
  relatedMemberId: string | null;
  relatedPaymentId: string | null;
  createdAt: string;
};

export const columns: ColumnDef<CashTransactionSerializable>[] = [
  {
    accessorKey: 'transactionDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ row }) => {
      // Usar a substring para evitar deslocamento de fuso no parse se necessário,
      // mas mantendo simples:
      const date = new Date(row.original.transactionDate);
      return format(date, 'dd/MM/yyyy');
    }
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={type === 'saida' ? 'destructive' : 'default'} className="capitalize">
          {type === 'saida' ? 'Saída' : 'Entrada'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Tipo',
      variant: 'multiSelect',
      options: [
        { label: 'Entrada', value: 'entrada' },
        { label: 'Saída', value: 'saida' }
      ]
    }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Categoria' />
    ),
    cell: ({ row }) => <span>{row.original.category}</span>,
    enableColumnFilter: true,
    meta: {
      label: 'Categoria',
      variant: 'text'
    }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descrição' />
    ),
    cell: ({ row }) => (
      <span className="truncate max-w-[200px] block" title={row.original.description || ''}>
        {row.original.description || '-'}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.original.amount.toString());
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
      return <div className="font-semibold">{formatted}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction transaction={row.original} />
  }
];
