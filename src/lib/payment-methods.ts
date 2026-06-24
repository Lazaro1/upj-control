const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  deposito: 'Depósito',
  cheque: 'Cheque'
};

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return 'Não informado';
  const normalized = method.toLowerCase().replace(/\s+/g, '_');
  return PAYMENT_METHOD_LABELS[normalized] || method;
}
