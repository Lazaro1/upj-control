'use client';

import { useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { columns, type PortalTransaction } from './columns';
import { PortalTransactionsToolbar } from './portal-transactions-toolbar';
import { PortalTransactionsMobileList } from './portal-transactions-mobile-list';
import { PortalTransactionsDesktopTable } from './portal-transactions-desktop-table';
import { PortalTransactionsPagination } from './portal-transactions-pagination';

interface TransactionsTableProps {
  data: PortalTransaction[];
  pageCount: number;
  totalItems: number;
}

export function TransactionsTable({
  data,
  pageCount,
  totalItems
}: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useQueryState(
    'status',
    parseAsString.withDefault('all')
  );

  const filteredData = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') {
      return data;
    }

    return data.filter((item) => item.effectiveStatus === statusFilter);
  }, [data, statusFilter]);

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 300
  });

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-4'>
      <PortalTransactionsToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        visibleCount={filteredData.length}
      />
      <PortalTransactionsMobileList table={table} />
      <PortalTransactionsDesktopTable table={table} />
      <PortalTransactionsPagination table={table} totalItems={totalItems} />
    </div>
  );
}
