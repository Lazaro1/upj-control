const MIN_REVERSE_REASON_LENGTH = 10;

export function normalizeReversePaymentReason(reason: string): string {
  const normalized = reason.trim();

  if (normalized.length < MIN_REVERSE_REASON_LENGTH) {
    throw new Error('Motivo do estorno deve ter ao menos 10 caracteres.');
  }

  return normalized;
}

export { MIN_REVERSE_REASON_LENGTH };
