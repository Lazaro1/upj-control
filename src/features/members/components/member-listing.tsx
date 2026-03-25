'use client';

import * as React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 }
    }
  });

  const [searchField, setSearchField] = React.useState<string>('fullName');
  const currentFilterValue =
    (table.getColumn(searchField)?.getFilterValue() as string) ?? '';

  const handleSearchChange = (value: string) => {
    table.getColumn(searchField)?.setFilterValue(value);
  };

  const handleFieldChange = (newField: string) => {
    table.getColumn(searchField)?.setFilterValue('');
    setSearchField(newField);
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar
        table={table}
        searchBar={
          <div className='flex items-center gap-2'>
            <Select value={searchField} onValueChange={handleFieldChange}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Buscar por...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='fullName'>Nome</SelectItem>
                <SelectItem value='email'>E-mail</SelectItem>
                <SelectItem value='phone'>Telefone</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Buscar...`}
              value={currentFilterValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='max-w-sm'
            />
          </div>
        }
      />
      <DataTable table={table} />
    </div>
  );
}
