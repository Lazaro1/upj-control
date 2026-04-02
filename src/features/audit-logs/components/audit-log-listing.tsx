'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuditLogFilters } from './audit-log-filters';
import { AuditLogDetailsDrawer } from './audit-log-details-drawer';
import { getAuditActionLabel } from '../constants/audit-action-options';

interface AuditLogItem {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actorMember?: {
    fullName: string;
  } | null;
}

interface AuditLogListingProps {
  initialItems: AuditLogItem[];
  initialPagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const DEFAULT_FILTERS = {
  actorUserId: '',
  action: '',
  dateFrom: '',
  dateTo: ''
};

export function AuditLogListing({
  initialItems,
  initialPagination
}: AuditLogListingProps) {
  const [items, setItems] = useState(initialItems);
  const [pagination, setPagination] = useState(initialPagination);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<unknown | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const empty = useMemo(
    () => !isLoading && items.length === 0,
    [isLoading, items]
  );

  function syncUrl(page: number, nextFilters = filters) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pagination.pageSize)
    });

    if (nextFilters.actorUserId)
      params.set('actorUserId', nextFilters.actorUserId);
    if (nextFilters.action) params.set('action', nextFilters.action);
    if (nextFilters.dateFrom) params.set('dateFrom', nextFilters.dateFrom);
    if (nextFilters.dateTo) params.set('dateTo', nextFilters.dateTo);

    window.history.replaceState(null, '', `?${params.toString()}`);
  }

  async function fetchLogs(page = 1, nextFilters = filters) {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize)
      });

      if (nextFilters.actorUserId)
        params.set('actorUserId', nextFilters.actorUserId);
      if (nextFilters.action) params.set('action', nextFilters.action);
      if (nextFilters.dateFrom) params.set('dateFrom', nextFilters.dateFrom);
      if (nextFilters.dateTo) params.set('dateTo', nextFilters.dateTo);

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setItems(data.items || []);
      setPagination(data.pagination || pagination);
      syncUrl(page, nextFilters);
    } catch (e: any) {
      setError(e.message || 'Falha ao consultar auditoria.');
    } finally {
      setIsLoading(false);
    }
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    void fetchLogs(1, DEFAULT_FILTERS);
  }

  async function openDetails(id: string) {
    try {
      const response = await fetch(`/api/audit-logs/${id}`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setSelectedDetail(data);
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar detalhe do log.');
    }
  }

  return (
    <div className='space-y-4'>
      <AuditLogFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => void fetchLogs(1)}
        onClear={clearFilters}
      />

      {error ? (
        <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      <div className='overflow-x-auto rounded-md border'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='px-3 py-2 text-left'>Data/Hora</th>
              <th className='px-3 py-2 text-left'>Ator</th>
              <th className='px-3 py-2 text-left'>Acao</th>
              <th className='px-3 py-2 text-left'>Entidade</th>
              <th className='px-3 py-2 text-left'>ID entidade</th>
              <th className='px-3 py-2 text-right'>Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className='border-t'>
                <td className='px-3 py-2'>
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className='px-3 py-2'>
                  {item.actorMember?.fullName ||
                    item.actorUserId ||
                    'Nao identificado'}
                </td>
                <td className='px-3 py-2'>
                  {getAuditActionLabel(item.action)}
                </td>
                <td className='px-3 py-2'>{item.entityType}</td>
                <td className='px-3 py-2'>{item.entityId}</td>
                <td className='px-3 py-2 text-right'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => void openDetails(item.id)}
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
            {empty ? (
              <tr className='border-t'>
                <td
                  className='text-muted-foreground px-3 py-8 text-center'
                  colSpan={6}
                >
                  Nenhum log encontrado para os filtros informados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Pagina {pagination.page} de {Math.max(1, pagination.totalPages)}
        </p>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => void fetchLogs(pagination.page - 1)}
          >
            Anterior
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => void fetchLogs(pagination.page + 1)}
          >
            Proxima
          </Button>
        </div>
      </div>

      <AuditLogDetailsDrawer
        open={!!selectedDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedDetail(null);
        }}
        data={selectedDetail}
      />
    </div>
  );
}
