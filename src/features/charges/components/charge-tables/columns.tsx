'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { format } from 'date-fns';

export type ChargeSerializable = {
  id: string;
  memberId: string;
  chargeTypeId: string;
  member: {
    id: string;
    fullName: string;
    email: string;
  };
  chargeType: {
    id: string;
    name: string;
  };
  competenceDate: string;
  dueDate: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: string;
};

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'warning'
> = {
  pendente: 'warning',
  parcialmente_paga: 'secondary',
  paga: 'default',
  cancelada: 'destructive',
  estornada: 'destructive'
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  parcialmente_paga: 'Pago Parcialmente',
  paga: 'Paga',
  cancelada: 'Cancelada',
  estornada: 'Estornada'
};

export const columns: ColumnDef<ChargeSerializable>[] = [
  {
    accessorKey: 'member.fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Membro' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.member.fullName}</span>
        <span className='text-xs text-muted-foreground'>{row.original.member.email}</span>
      </div>
    ),
    enableColumnFilter: true
  },
  {
    accessorKey: 'chargeType.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => <span>{row.original.chargeType.name}</span>,
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
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vencimento' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.dueDate);
      return format(date, 'dd/MM/yyyy');
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      // Tratar warning se vencido
      const isOverdue = status === 'pendente' && new Date(row.original.dueDate) < new Date();
      return (
        <Badge variant={isOverdue ? 'destructive' : (statusVariant[status] as any) ?? 'outline'} className="capitalize">
          {isOverdue ? 'Vencida' : statusLabels[status]}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [
        { label: 'Pendente', value: 'pendente' },
        { label: 'Paga', value: 'paga' },
        { label: 'Pago Parcialmente', value: 'parcialmente_paga' },
        { label: 'Cancelada', value: 'cancelada' },
        { label: 'Estornada', value: 'estornada' }
      ]
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction charge={row.original} />
  }
];
