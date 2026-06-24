export const portalStatusLabels: Record<string, string> = {
  pendente: 'Pendente',
  vencido: 'Vencido',
  parcialmente_paga: 'Pago Parcialmente',
  paga: 'Pago',
  cancelada: 'Cancelado',
  estornada: 'Estornado'
};

export const portalStatusFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Vencidos', value: 'vencido' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Parcialmente pagos', value: 'parcialmente_paga' },
  { label: 'Pagos', value: 'paga' },
  { label: 'Cancelados', value: 'cancelada' }
] as const;

export function getEffectiveStatus(
  status: string,
  dueDate: string | Date
): string {
  if (status === 'pendente' && new Date(dueDate) < new Date()) {
    return 'vencido';
  }
  return status;
}
