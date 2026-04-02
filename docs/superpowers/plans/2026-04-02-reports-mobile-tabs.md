# Relatorios Financeiros Mobile Tabs Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir as abas por um seletor compacto no mobile para escolher o tipo de relatorio, mantendo tabs no desktop e sem alterar logica de dados.

**Architecture:** Introduzir uma lista central de opcoes de aba (value/label) usada tanto pelas tabs quanto pelo select. Em mobile, esconder a `TabsList` e exibir um `Select` sincronizado com `activeTab`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui (Select, Tabs).

---

## File Structure

- Create: `src/features/reports/components/report-tab-options.ts`
  - Responsabilidade: fonte unica de verdade das opcoes de tabs (value/label) e tipo derivado.
- Create: `src/features/reports/components/__tests__/report-tab-options.test.ts`
  - Responsabilidade: garantir ordem/valores/rotulos das opcoes.
- Modify: `src/features/reports/components/reports-page.tsx`
  - Responsabilidade: usar `REPORT_TABS` para tabs e select; renderizar select no mobile.

---

### Task 1: Centralizar opcoes de tabs + teste unitario basico

**Files:**

- Create: `src/features/reports/components/report-tab-options.ts`
- Create: `src/features/reports/components/__tests__/report-tab-options.test.ts`

- [ ] **Step 1: Escrever o teste falhando**

```ts
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
```

- [ ] **Step 2: Rodar o teste para ver falhar**

Run:

```bash
node --test "src/features/reports/components/__tests__/report-tab-options.test.ts"
```

Expected: FAIL com erro de modulo nao encontrado para `../report-tab-options`.

- [ ] **Step 3: Implementar o modulo das opcoes**

```ts
export const REPORT_TABS = [
  { value: 'income', label: 'Entradas' },
  { value: 'expenses', label: 'Saidas' },
  { value: 'balance', label: 'Saldo' },
  { value: 'by-charge-type', label: 'Por Tipo de Cobranca' },
  { value: 'member-position', label: 'Posicao Individual' },
  { value: 'delinquency', label: 'Inadimplencia' }
] as const;

export type ReportsTabValue = (typeof REPORT_TABS)[number]['value'];
```

- [ ] **Step 4: Rodar o teste novamente**

Run:

```bash
node --test "src/features/reports/components/__tests__/report-tab-options.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reports/components/report-tab-options.ts src/features/reports/components/__tests__/report-tab-options.test.ts
git commit -m "test: add report tab options coverage"
```

---

### Task 2: Select no mobile sincronizado com as tabs

**Files:**

- Modify: `src/features/reports/components/reports-page.tsx`

- [ ] **Step 1: Atualizar imports e tipo de tabs**

```ts
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { REPORT_TABS, type ReportsTabValue } from './report-tab-options';
```

Remover a definicao local de `ReportsTabValue` do arquivo.

- [ ] **Step 2: Adicionar o Select para mobile (antes do Tabs)**

```tsx
<div className='space-y-2 sm:hidden'>
  <label className='text-foreground text-sm font-medium'>
    Tipo de relatorio
  </label>
  <Select value={activeTab} onValueChange={handleTabChange}>
    <SelectTrigger className='w-full'>
      <SelectValue placeholder='Selecione um relatorio' />
    </SelectTrigger>
    <SelectContent>
      {REPORT_TABS.map((tab) => (
        <SelectItem key={tab.value} value={tab.value}>
          {tab.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 3: Renderizar tabs a partir de `REPORT_TABS` e ocultar no mobile**

```tsx
<TabsList className='hidden h-auto flex-wrap sm:flex'>
  {REPORT_TABS.map((tab) => (
    <TabsTrigger key={tab.value} value={tab.value}>
      {tab.label}
    </TabsTrigger>
  ))}
</TabsList>
```

- [ ] **Step 4: Rodar teste de configuracao novamente**

Run:

```bash
node --test "src/features/reports/components/__tests__/report-tab-options.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/reports/components/reports-page.tsx
git commit -m "feat: add mobile report type selector"
```

---

## Self-Review

### Spec Coverage

- Selecao no mobile via select: Task 2.
- Manter tabs no desktop: Task 2.
- Fonte unica de opcoes: Task 1 + Task 2.
- Sem alteracoes em dados/exportacao: nenhuma tarefa toca server actions ou export handlers.

### Placeholder Scan

- Nenhum "TBD"/"TODO" presente.

### Type Consistency

- `ReportsTabValue` vem de `report-tab-options.ts` e e usado em `reports-page.tsx`.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-02-reports-mobile-tabs.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
