# Implementation Plan: Auditoria Reforcada (Parte 3.4)

**Branch**: `[002-auditoria-reforcada]` | **Date**: 2026-03-31 | **Spec**: `/specs/002-auditoria-reforcada/spec.md`
**Input**: Feature specification from `/specs/002-auditoria-reforcada/spec.md`

## Summary

Implementar reforco de auditoria para operacoes criticas financeiras com tres entregas principais: (1) padronizacao e cobertura completa de eventos auditaveis, (2) consulta de logs com filtros e paginacao, (3) controle rigoroso de acesso e integridade (somente leitura). O plano reutiliza o padrao atual do UPJ com App Router, server actions e Prisma, adicionando estrutura de dados e contratos de consulta para auditoria.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), React 19, Next.js 16  
**Primary Dependencies**: Next.js App Router, Prisma Client, Clerk, shadcn/ui  
**Storage**: PostgreSQL via Prisma (`audit_logs`, `charges`, `payments`, `members`, `charge_types`, `recurring_charge_rules`, `cash_transactions`)  
**Testing**: Validacao por criterios Given/When/Then da spec + verificacao estaticas (`tsc`, lint quando ambiente suportar)  
**Target Platform**: Web (dashboard interno de tesouraria)  
**Project Type**: Aplicacao web monolitica (UI + rotas + server actions no mesmo repositorio)  
**Performance Goals**: Listagem paginada com filtros em resposta operacional (<3s p95 em massa de homologacao)  
**Constraints**: Bloqueio explicito de `org:member`; logs imutaveis; isolamento por `org_id`; sem misturar com itens fora de 3.4  
**Scale/Scope**: 1 modulo de consulta de auditoria + padronizacao de eventos em fluxos criticos + 2 contratos de leitura

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- O arquivo `.specify/memory/constitution.md` esta em formato placeholder, sem principios/gates efetivos definidos.
- Gate aplicado por convencoes do repositorio (AGENTS.md + padroes existentes).
- Resultado pre-Phase 0: **PASS** (sem violacoes conhecidas).

### Post-Design Constitution Check

- Design permanece aderente ao padrao do projeto (feature-based + App Router + Prisma + Clerk).
- Nenhuma nova dependencia estrutural fora do ecossistema atual.
- Resultado apos Phase 1: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/002-auditoria-reforcada/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── audit-logs-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── dashboard/
│   │   └── audit-logs/
│   │       └── page.tsx
│   └── api/
│       └── audit-logs/
│           ├── route.ts
│           └── [id]/route.ts
├── features/
│   └── audit-logs/
│       ├── components/
│       │   ├── audit-log-listing.tsx
│       │   ├── audit-log-filters.tsx
│       │   └── audit-log-details-drawer.tsx
│       ├── server/
│       │   ├── audit-log.actions.ts
│       │   └── audit-log-writer.ts
│       └── schemas/
│           └── audit-log-filter.schema.ts
├── config/
│   └── nav-config.ts
└── lib/
    └── db.ts

prisma/
├── schema.prisma
└── migrations/
```

**Structure Decision**: criar feature dedicada `src/features/audit-logs` para separar consulta/escrita de auditoria dos modulos financeiros existentes, mantendo eventos auditaveis nos fluxos originais (charges/payments/roles/period) via utilitario comum de escrita.

## Phase 0 Research Output

Decisoes consolidadas em `specs/002-auditoria-reforcada/research.md`:

1. Padronizar evento e entidade com catalogo central de `action`.
2. Registrar auditoria no mesmo fluxo transacional da operacao critica.
3. Introduzir `org_id` em `audit_logs` para isolamento multi-tenant.
4. Expor contratos de leitura (lista e detalhe) com filtros e paginacao.

## Phase 1 Design Output

- `specs/002-auditoria-reforcada/data-model.md`
- `specs/002-auditoria-reforcada/contracts/audit-logs-api.yaml`
- `specs/002-auditoria-reforcada/quickstart.md`

## Complexity Tracking

Sem violacoes de complexidade que exijam justificativa adicional no momento.
