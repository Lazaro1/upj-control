'use client';

import { Badge } from '@/components/ui/badge';
import {
  getEffectiveStatus,
  portalStatusLabels
} from '@/features/member-portal/lib/transaction-status';
import type { PortalTransaction } from './columns';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendente: 'outline',
  vencido: 'destructive',
  parcialmente_paga: 'secondary',
  paga: 'default',
  cancelada: 'destructive',
  estornada: 'destructive'
};

export function TransactionStatusBadge({
  transaction
}: {
  transaction: Pick<PortalTransaction, 'status' | 'dueDate' | 'effectiveStatus'>;
}) {
  const effectiveStatus =
    transaction.effectiveStatus ??
    getEffectiveStatus(transaction.status, transaction.dueDate);

  return (
    <Badge variant={statusVariant[effectiveStatus] ?? 'outline'}>
      {portalStatusLabels[effectiveStatus] ?? effectiveStatus}
    </Badge>
  );
}
