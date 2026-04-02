export interface AuditActionOption {
  value: string;
  label: string;
}

export const AUDIT_ACTION_OPTIONS: AuditActionOption[] = [
  { value: 'charge.created', label: 'Cobranca criada' },
  { value: 'charge.updated', label: 'Cobranca atualizada' },
  { value: 'charge.cancelled', label: 'Cobranca cancelada' },
  {
    value: 'charge.recurring_bulk_processed',
    label: 'Lancamento mensal processado'
  },
  { value: 'payment.created', label: 'Pagamento criado' },
  { value: 'payment.allocated', label: 'Pagamento alocado' },
  { value: 'payment.reversed', label: 'Pagamento estornado' },
  { value: 'cash_transaction.created', label: 'Movimentacao de caixa criada' },
  { value: 'role.permission_changed', label: 'Permissao de papel alterada' },
  { value: 'period.closed', label: 'Periodo encerrado' }
];

const ACTION_LABEL_MAP = new Map(
  AUDIT_ACTION_OPTIONS.map((option) => [option.value, option.label])
);

export function getAuditActionLabel(action: string): string {
  return ACTION_LABEL_MAP.get(action) ?? action;
}
