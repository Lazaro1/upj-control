'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { CellAction } from './cell-action';
import type { Member } from '@prisma/client';

// Tipo auxiliar para lidar com a serialização do Prisma no Next.js
export type MemberSerializable = Omit<Member, 'creditBalance'> & {
  creditBalance: number;
};

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ativo: 'default',
  inativo: 'destructive',
  licenciado: 'secondary',
  remido: 'outline'
};

export const columns: ColumnDef<MemberSerializable>[] = [
  {
    id: 'fullName',
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    ),
    enableColumnFilter: true
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='E-mail' />
    ),
    enableColumnFilter: true
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Telefone',
    enableColumnFilter: true,
    cell: ({ row }) => {
      const p = row.original.phone;
      if (!p) return '—';
      const numbers = p.replace(/\D/g, '');
      if (numbers.length === 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
      if (numbers.length === 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      }
      return p;
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariant[status] ?? 'outline'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: [
        { label: 'Ativo', value: 'ativo' },
        { label: 'Inativo', value: 'inativo' },
        { label: 'Licenciado', value: 'licenciado' },
        { label: 'Remido', value: 'remido' }
      ]
    }
  },
  {
    accessorKey: 'joinedAt',
    header: 'Data de Ingresso',
    cell: ({ row }) => {
      const date = row.original.joinedAt;
      return date ? new Date(date).toLocaleDateString('pt-BR') : '—';
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction member={row.original} />
  }
];
