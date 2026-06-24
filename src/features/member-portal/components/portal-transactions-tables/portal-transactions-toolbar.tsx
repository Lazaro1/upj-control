'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { portalStatusFilterOptions } from '@/features/member-portal/lib/transaction-status';

interface PortalTransactionsToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  visibleCount: number;
}

export function PortalTransactionsToolbar({
  statusFilter,
  onStatusFilterChange,
  visibleCount
}: PortalTransactionsToolbarProps) {
  return (
    <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className='h-10 w-full sm:w-[220px]'>
          <SelectValue placeholder='Filtrar por situação' />
        </SelectTrigger>
        <SelectContent>
          {portalStatusFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className='text-sm text-muted-foreground'>
        {visibleCount} lançamento(s) nesta página
      </p>
    </div>
  );
}
