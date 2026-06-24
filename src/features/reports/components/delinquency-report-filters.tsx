'use client';

import { useState } from 'react';
import { IconCalendarEvent, IconFilter } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ChargeTypeOption {
  id: string;
  name: string;
}

interface DelinquencyReportFiltersProps {
  chargeTypeOptions: ChargeTypeOption[];
  isLoading?: boolean;
  initialDueDateFrom: string;
  initialDueDateTo: string;
  initialChargeTypeId?: string;
  onFilter: (filters: {
    dueDateFrom: string;
    dueDateTo: string;
    chargeTypeId: string | undefined;
  }) => void;
}

export function DelinquencyReportFilters({
  chargeTypeOptions,
  isLoading = false,
  initialDueDateFrom,
  initialDueDateTo,
  initialChargeTypeId,
  onFilter
}: DelinquencyReportFiltersProps) {
  const [dueDateFrom, setDueDateFrom] = useState(initialDueDateFrom);
  const [dueDateTo, setDueDateTo] = useState(initialDueDateTo);
  const [chargeTypeId, setChargeTypeId] = useState(
    initialChargeTypeId || 'all'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleApplyFilters() {
    if (dueDateFrom && dueDateTo && dueDateFrom > dueDateTo) {
      setValidationError('Data inicial nao pode ser maior que a data final.');
      return;
    }

    setValidationError(null);
    onFilter({
      dueDateFrom,
      dueDateTo,
      chargeTypeId: chargeTypeId === 'all' ? undefined : chargeTypeId
    });
  }

  function handleClearFilters() {
    setValidationError(null);
    setChargeTypeId('all');
    onFilter({
      dueDateFrom,
      dueDateTo,
      chargeTypeId: undefined
    });
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-end gap-4'>
        <div className='space-y-2'>
          <label className='text-foreground text-sm font-medium'>
            Vencimento inicial
          </label>
          <div className='relative'>
            <IconCalendarEvent className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              type='date'
              value={dueDateFrom}
              onChange={(event) => setDueDateFrom(event.target.value)}
              className='w-[180px] pl-10'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-foreground text-sm font-medium'>
            Vencimento final
          </label>
          <div className='relative'>
            <IconCalendarEvent className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              type='date'
              value={dueDateTo}
              onChange={(event) => setDueDateTo(event.target.value)}
              className='w-[180px] pl-10'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-foreground text-sm font-medium'>
            Tipo de cobranca
          </label>
          <Select value={chargeTypeId} onValueChange={setChargeTypeId}>
            <SelectTrigger className='w-[240px]'>
              <SelectValue placeholder='Todos os tipos' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos os tipos</SelectItem>
              {chargeTypeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <Button onClick={handleApplyFilters} disabled={isLoading}>
            <IconFilter className='mr-1 h-4 w-4' /> Filtrar
          </Button>
          <Button
            variant='outline'
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Limpar tipo
          </Button>
        </div>
      </div>

      {validationError ? (
        <p className='text-sm text-red-500'>{validationError}</p>
      ) : null}
    </div>
  );
}
