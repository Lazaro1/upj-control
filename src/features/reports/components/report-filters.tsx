'use client';

import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { IconCalendarEvent } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportFiltersProps {
  onFilter: (dateFrom: string, dateTo: string) => void;
  isLoading?: boolean;
}

export function ReportFilters({
  onFilter,
  isLoading = false
}: ReportFiltersProps) {
  const [dateFrom, setDateFrom] = useState(() =>
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className='flex flex-wrap items-end gap-4'>
      <div className='space-y-2'>
        <label className='text-foreground text-sm font-medium'>
          Data Inicial
        </label>
        <div className='relative'>
          <IconCalendarEvent className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            type='date'
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className='w-[180px] pl-10'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <label className='text-foreground text-sm font-medium'>
          Data Final
        </label>
        <div className='relative'>
          <IconCalendarEvent className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            type='date'
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className='w-[180px] pl-10'
          />
        </div>
      </div>

      <Button onClick={() => onFilter(dateFrom, dateTo)} disabled={isLoading}>
        Gerar Relatório
      </Button>
    </div>
  );
}
