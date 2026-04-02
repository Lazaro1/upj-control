'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import type { ChargeType } from '@prisma/client';

export type ChargeTypeSerializable = Omit<ChargeType, 'defaultAmount'> & {
  defaultAmount: number | null;
};

export const columns: ColumnDef<ChargeTypeSerializable>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    ),
    enableColumnFilter: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descrição' />
    ),
    cell: ({ row }) => row.original.description || '—'
  },
  {
    id: 'defaultAmount',
    accessorKey: 'defaultAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Padrão' />
    ),
    cell: ({ row }) => {
      const amount = row.original.defaultAmount;
      return amount !== null
        ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(amount)
        : 'Variável';
    }
  },
  {
    id: 'isRecurring',
    accessorKey: 'isRecurring',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recorrente' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.isRecurring ? 'default' : 'secondary'}>
        {row.original.isRecurring ? 'Sim' : 'Não'}
      </Badge>
    )
  },
  {
    id: 'active',
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.active ? 'default' : 'destructive'}>
        {row.original.active ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'select',
      options: [
        { label: 'Ativo', value: 'true' },
        { label: 'Inativo', value: 'false' }
      ]
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction chargeType={row.original} />
  }
];
