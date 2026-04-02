import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REPORT_TABS } from '../report-tab-options';

describe('REPORT_TABS', () => {
  it('mantem ordem e labels esperados', () => {
    const values = REPORT_TABS.map((tab) => tab.value);
    const labels = REPORT_TABS.map((tab) => tab.label);

    assert.deepEqual(values, [
      'income',
      'expenses',
      'balance',
      'by-charge-type',
      'member-position',
      'delinquency'
    ]);

    assert.deepEqual(labels, [
      'Entradas',
      'Saidas',
      'Saldo',
      'Por Tipo de Cobranca',
      'Posicao Individual',
      'Inadimplencia'
    ]);
  });

  it('nao possui valores duplicados', () => {
    const values = REPORT_TABS.map((tab) => tab.value);
    const uniqueValues = new Set(values);
    assert.equal(uniqueValues.size, REPORT_TABS.length);
  });
});
