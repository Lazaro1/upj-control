'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useQueryState, useQueryStates, parseAsInteger, parseAsString } from 'nuqs';
import { Input } from '@/components/ui/input';
import { columns, type CashTransactionSerializable } from './columns';

interface CashTransactionsTableProps {
  data: CashTransactionSerializable[];
  totalItems: number;
}

export function CashTransactionsTable({ data, totalItems }: CashTransactionsTableProps) {
  const pageCount = Math.ceil(totalItems / 10);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  const [queryParams, setQueryParams] = useQueryStates({
    dateFrom: parseAsString.withOptions({ shallow: false }),
    dateTo: parseAsString.withOptions({ shallow: false }),
    page: parseAsInteger.withOptions({ shallow: false }).withDefault(1)
  });

  const { dateFrom, dateTo } = queryParams;

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={dateFrom || ''} 
            onChange={(e) => {
              setQueryParams({
                dateFrom: e.target.value || null,
                page: 1
              });
            }}
            className="h-8 w-[130px]"
            title="Data Inicial"
          />
          <span className="text-muted-foreground text-sm">até</span>
          <Input 
            type="date" 
            value={dateTo || ''} 
            onChange={(e) => {
              setQueryParams({
                dateTo: e.target.value || null,
                page: 1
              });
            }}
            className="h-8 w-[130px]"
            title="Data Final"
          />
        </div>
      </DataTableToolbar>
    </DataTable>
  );
}
