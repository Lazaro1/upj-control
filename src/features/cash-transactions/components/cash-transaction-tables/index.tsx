'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useQueryStates, parseAsString } from 'nuqs';
import { Input } from '@/components/ui/input';
import { columns, type CashTransactionSerializable } from './columns';

interface CashTransactionsTableProps {
  data: CashTransactionSerializable[];
  totalItems: number;
}

export function CashTransactionsTable({
  data,
  totalItems
}: CashTransactionsTableProps) {
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
    dateTo: parseAsString.withOptions({ shallow: false })
  });

  const { dateFrom, dateTo } = queryParams;

  const hasDateFilter = Boolean(dateFrom || dateTo);

  function handleResetFilters(): void {
    table.setPageIndex(0);
    setQueryParams({
      dateFrom: null,
      dateTo: null
    });
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar
        table={table}
        hasCustomFilters={hasDateFilter}
        onResetFilters={handleResetFilters}
        resetLabel='Limpar filtros'
      >
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
          <Input
            type='date'
            value={dateFrom || ''}
            onChange={(e) => {
              table.setPageIndex(0);
              setQueryParams({
                dateFrom: e.target.value || null
              });
            }}
            className='h-8 w-full sm:w-[180px] sm:min-w-[180px]'
            title='Data Inicial'
          />
          <span className='text-muted-foreground hidden text-sm sm:inline'>
            até
          </span>
          <Input
            type='date'
            value={dateTo || ''}
            onChange={(e) => {
              table.setPageIndex(0);
              setQueryParams({
                dateTo: e.target.value || null
              });
            }}
            className='h-8 w-full sm:w-[180px] sm:min-w-[180px]'
            title='Data Final'
          />
        </div>
      </DataTableToolbar>
    </DataTable>
  );
}
