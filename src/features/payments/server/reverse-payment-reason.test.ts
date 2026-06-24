import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeReversePaymentReason } from './reverse-payment-reason';

test('accepts reason with at least 10 non-space characters after trim', () => {
  const value = normalizeReversePaymentReason('  Ajuste de lançamento  ');
  assert.equal(value, 'Ajuste de lançamento');
});

test('rejects empty reason', () => {
  assert.throws(() => normalizeReversePaymentReason('   '), {
    message: 'Motivo do estorno deve ter ao menos 10 caracteres.'
  });
});

test('rejects too short reason', () => {
  assert.throws(() => normalizeReversePaymentReason('curto'), {
    message: 'Motivo do estorno deve ter ao menos 10 caracteres.'
  });
});
