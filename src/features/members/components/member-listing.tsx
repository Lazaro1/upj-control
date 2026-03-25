'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { columns, type MemberSerializable } from './member-tables/columns';

interface MemberListingProps {
  data: MemberSerializable[];
  totalItems: number;
  pageCount: number;
}

export function MemberListing({
  data,
  totalItems,
  pageCount
}: MemberListingProps) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 }
    }
  });

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table} />
      <DataTable table={table} />
    </div>
  );
}
