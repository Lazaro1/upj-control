import assert from 'node:assert/strict';
import test from 'node:test';
import { arrayToCSV } from './csv-export';

test('neutralizes excel formula injection values for member-position export fields', () => {
  const csv = arrayToCSV(
    [
      { key: 'memberName', label: 'Membro' },
      { key: 'totalCharged', label: 'Total Cobrado' },
      { key: 'totalPaid', label: 'Total Pago' },
      { key: 'balance', label: 'Saldo' }
    ],
    [
      {
        memberName: '=HYPERLINK("http://evil")',
        totalCharged: 100,
        totalPaid: 20,
        balance: 80
      }
    ]
  );

  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /'=?HYPERLINK/);
});

test('neutralizes formula prefixes used by income and expenses exports', () => {
  const csv = arrayToCSV(
    [
      { key: 'source', label: 'Origem' },
      { key: 'category', label: 'Categoria' },
      { key: 'total', label: 'Total (R$)' }
    ],
    [
      {
        source: '+SUM(1,2)',
        category: '@cmd',
        total: 10
      },
      {
        source: '-10+20',
        category: '\t=2+2',
        total: 15
      }
    ]
  );

  assert.match(csv, /'\+SUM\(1,2\)/);
  assert.match(csv, /'@cmd/);
  assert.match(csv, /'-10\+20/);
  assert.match(csv, /'\t=2\+2/);
});

test('keeps regular strings intact while still escaping separators', () => {
  const csv = arrayToCSV(
    [
      { key: 'memberName', label: 'Membro' },
      { key: 'category', label: 'Categoria' }
    ],
    [
      {
        memberName: 'Joao da Silva',
        category: 'Doacoes;Eventos'
      }
    ]
  );

  assert.match(csv, /Joao da Silva/);
  assert.match(csv, /"Doacoes;Eventos"/);
  assert.doesNotMatch(csv, /'Joao da Silva/);
});
