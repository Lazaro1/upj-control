export const REPORT_TABS = [
  { value: 'income', label: 'Entradas' },
  { value: 'expenses', label: 'Saidas' },
  { value: 'balance', label: 'Saldo' },
  { value: 'by-charge-type', label: 'Por Tipo de Cobranca' },
  { value: 'member-position', label: 'Posicao Individual' },
  { value: 'delinquency', label: 'Inadimplencia' }
] as const;

export type ReportsTabValue = (typeof REPORT_TABS)[number]['value'];
