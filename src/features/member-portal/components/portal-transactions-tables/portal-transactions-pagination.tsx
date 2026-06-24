'use client';

import type { Table as TanstackTable } from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PortalTransaction } from './columns';

interface PortalTransactionsPaginationProps {
  table: TanstackTable<PortalTransaction>;
  totalItems: number;
  className?: string;
}

export function PortalTransactionsPagination({
  table,
  totalItems,
  className
}: PortalTransactionsPaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className='text-sm text-muted-foreground'>
        {totalItems} lançamento(s) no total
      </p>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Por página</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className='h-10 w-[72px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className='text-center text-sm font-medium'>
          Página {pageIndex + 1} de {Math.max(pageCount, 1)}
        </p>

        <div className='grid grid-cols-2 gap-2 sm:flex sm:items-center'>
          <Button
            variant='outline'
            className='h-10 w-full sm:w-auto'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className='mr-1 h-4 w-4' />
            Anterior
          </Button>
          <Button
            variant='outline'
            className='h-10 w-full sm:w-auto'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
            <ChevronRightIcon className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
