'use client';

import * as React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { Input } from '@/components/ui/input';
import { columns, type ChargeTypeSerializable } from './charge-type-tables/columns';

interface ChargeTypeListingProps {
  data: ChargeTypeSerializable[];
  totalItems: number;
  pageCount: number;
}

export function ChargeTypeListing({
  data,
  totalItems,
  pageCount
}: ChargeTypeListingProps) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 }
    }
  });

  const currentFilterValue =
    (table.getColumn('name')?.getFilterValue() as string) ?? '';

  const handleSearchChange = (value: string) => {
    table.getColumn('name')?.setFilterValue(value);
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar
        table={table}
        searchBar={
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Buscar tipo de cobrança...'
              value={currentFilterValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='w-[250px]'
            />
          </div>
        }
      />
      <DataTable table={table} />
    </div>
  );
}
