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
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='E-mail' />
    )
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ row }) => row.original.phone || '—'
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
