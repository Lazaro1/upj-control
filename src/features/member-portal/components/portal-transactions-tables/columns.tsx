'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

export type PortalTransaction = {
  id: string;
  memberId: string;
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
  paymentAllocations: any[]; // Pagamentos associados
};

const statusVariant: Record<string, string> = {
  pendente: 'warning',
  parcialmente_paga: 'secondary',
  paga: 'default',
  cancelada: 'destructive',
  estornada: 'destructive'
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  parcialmente_paga: 'Pago Parcialmente',
  paga: 'Pago',
  cancelada: 'Cancelado',
  estornada: 'Estornado'
};

export const columns: ColumnDef<PortalTransaction>[] = [
  {
    accessorKey: 'chargeType.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo de Cobrança' />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.chargeType?.name || 'Cobrança Avulsa'}</span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground">{row.original.description}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'competenceDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Competência' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.competenceDate);
      return <span className="capitalize">{format(date, 'MMM/yyyy', { locale: ptBR })}</span>;
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
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Cobrado' />
    ),
    cell: ({ row }) => {
      return <div className="font-semibold">{formatCurrency(row.original.amount)}</div>;
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Situação',
    cell: ({ row }) => {
      const status = row.original.status;
      const isOverdue = status === 'pendente' && new Date(row.original.dueDate) < new Date();
      
      return (
        <Badge 
          variant={isOverdue ? 'destructive' : (statusVariant[status] as any) ?? 'outline'} 
        >
          {isOverdue ? 'Vencido' : statusLabels[status]}
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
        { label: 'Cancelada', value: 'cancelada' }
      ]
    }
  }
];
