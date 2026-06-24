'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import { format } from 'date-fns';

export type PaymentSerializable = {
  id: string;
  memberId: string;
  member: {
    id: string;
    fullName: string;
    email: string;
  };
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  allocations: {
    id: string;
    chargeId: string;
    allocatedAmount: number;
    chargeTypeName: string;
  }[];
};

export const columns: ColumnDef<PaymentSerializable>[] = [
  {
    id: 'memberFullName',
    accessorKey: 'member.fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Membro' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.member.fullName}</span>
        <span className='text-muted-foreground text-xs'>
          {row.original.member.email}
        </span>
      </div>
    ),
    enableColumnFilter: true
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Pago' />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.original.amount.toString());
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount);
      return <div className='font-semibold'>{formatted}</div>;
    }
  },
  {
    id: 'paymentMethod',
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Método' />
    ),
    cell: ({ row }) => (
      <span className='capitalize'>{row.original.paymentMethod}</span>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Método',
      variant: 'multiSelect',
      options: [
        { label: 'PIX', value: 'pix' },
        { label: 'Transferência Bancária', value: 'transferencia' },
        { label: 'Dinheiro', value: 'dinheiro' },
        { label: 'Cartão de Crédito', value: 'cartao_credito' },
        { label: 'Boleto', value: 'boleto' }
      ]
    }
  },
  {
    id: 'paymentDate',
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data do Pagto.' />
    ),
    cell: ({ row }) => {
      return format(new Date(row.original.paymentDate), 'dd/MM/yyyy');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction payment={row.original} />
  }
];
