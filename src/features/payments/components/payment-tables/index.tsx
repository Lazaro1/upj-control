'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { columns, type PaymentSerializable } from './columns';

interface PaymentsTableProps {
  data: PaymentSerializable[];
  totalItems: number;
}

export function PaymentsTable({ data, totalItems }: PaymentsTableProps) {
  const pageCount = Math.ceil(totalItems / 10);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
