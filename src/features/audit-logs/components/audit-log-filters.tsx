'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AUDIT_ACTION_OPTIONS } from '../constants/audit-action-options';

interface AuditLogFiltersProps {
  filters: {
    actorUserId: string;
    action: string;
    dateFrom: string;
    dateTo: string;
  };
  onChange: (next: {
    actorUserId: string;
    action: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  onApply: () => void;
  onClear: () => void;
}

export function AuditLogFilters({
  filters,
  onChange,
  onApply,
  onClear
}: AuditLogFiltersProps) {
  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div className='space-y-1'>
        <label className='text-sm'>Usuario (ID)</label>
        <Input
          value={filters.actorUserId}
          onChange={(e) =>
            onChange({ ...filters, actorUserId: e.target.value })
          }
          placeholder='actor_user_id'
          className='w-[220px]'
        />
      </div>
      <div className='space-y-1'>
        <label className='text-sm'>Acao</label>
        <Select
          value={filters.action || 'all'}
          onValueChange={(value) =>
            onChange({ ...filters, action: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className='w-[240px]'>
            <SelectValue placeholder='Selecione a acao' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas as acoes</SelectItem>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-1'>
        <label className='text-sm'>Data inicial</label>
        <Input
          type='date'
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className='w-[180px]'
        />
      </div>
      <div className='space-y-1'>
        <label className='text-sm'>Data final</label>
        <Input
          type='date'
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className='w-[180px]'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Button onClick={onApply}>Filtrar</Button>
        <Button variant='outline' onClick={onClear}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
