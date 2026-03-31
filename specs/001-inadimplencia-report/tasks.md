# Tasks: Relatorio de Inadimplencia (Parte 3.3)

**Input**: Design documents from `/specs/001-inadimplencia-report/`
**Prerequisites**: `plan.md`, `spec.md`

**Tests**: Nao ha exigencia de suite automatizada na especificacao; validacao sera pelos criterios Given/When/Then (CA-001 a CA-009) e lint do projeto.

**Organization**: Tasks agrupadas por user story para entrega incremental e testavel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencia direta)
- **[Story]**: US1, US2, US3

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar contratos de dados, tipos e ponto de extensao do modulo de relatorios.

- [ ] T001 [P] [Setup] Definir tipos de resposta do relatorio de inadimplencia em `src/features/reports/server/report.actions.ts` (consolidado por irmao + detalhado por cobranca)
- [ ] T002 [P] [Setup] Criar utilitarios de formatacao de atraso/valor no contexto do relatorio em `src/features/reports/server/report.actions.ts`
- [ ] T003 [Setup] Revisar gate de acesso na pagina `src/app/dashboard/reports/page.tsx` para garantir semantica de bloqueio coerente com 403 para `org:member`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar base de dominio e seguranca que bloqueia todas as stories.

**CRITICAL**: Nenhuma user story com UI/exportacao comeca antes desta fase.

- [ ] T004 [Foundational] Implementar `getDelinquencyReport(...)` em `src/features/reports/server/report.actions.ts` com regras: `status=pendente`, `due_date < hoje`, filtros (tipo + periodo inclusivo), consolidacao por irmao e detalhamento por cobranca
- [ ] T005 [Foundational] Aplicar referencia temporal da organizacao para calculo de "hoje" e `daysOverdue` em `src/features/reports/server/report.actions.ts`
- [ ] T006 [Foundational] Garantir regra monetaria de exibicao/exportacao (2 casas, half-up) no payload serializado em `src/features/reports/server/report.actions.ts`
- [ ] T007 [Foundational] Reforcar RBAC da action para permitir apenas `org:treasurer`, `org:manager`, `org:admin` e negar `org:member` em `src/features/reports/server/report.actions.ts`

**Checkpoint**: Base de dados e regras de negocio prontas para consumo por UI e exportacoes.

---

## Phase 3: User Story 1 - Visualizar inadimplentes consolidados (Priority: P1) 🎯 MVP

**Goal**: Exibir inadimplencia por irmao com totais e cobranca mais antiga.

**Independent Test**: Acessar `/dashboard/reports`, abrir aba de inadimplencia e validar listagem consolidada apenas com cobrancas pendentes vencidas.

### Implementation for User Story 1

- [ ] T008 [US1] Adicionar aba "Inadimplencia" em `src/features/reports/components/reports-page.tsx` com estado dedicado de carregamento/erro/vazio
- [ ] T009 [P] [US1] Criar componente de tabela consolidada por irmao em `src/features/reports/components/delinquency-report-table.tsx`
- [ ] T010 [P] [US1] Criar componente de detalhe por cobranca com `daysOverdue` em `src/features/reports/components/delinquency-report-details.tsx`
- [ ] T011 [US1] Integrar chamada da server action `getDelinquencyReport(...)` no fluxo da aba em `src/features/reports/components/reports-page.tsx`
- [ ] T012 [US1] Implementar estado vazio e mensagens de erro de consulta na aba em `src/features/reports/components/reports-page.tsx`
- [ ] T013 [US1] Ajustar bloqueio de rota para retorno de acesso negado explicito a `org:member` em `src/app/dashboard/reports/page.tsx`

**Checkpoint**: US1 funcional e validavel independentemente (CA-001, CA-002, CA-006, CA-007).

---

## Phase 4: User Story 2 - Filtrar e detalhar atraso (Priority: P2)

**Goal**: Filtrar inadimplencia por tipo e periodo de vencimento com bordas inclusivas.

**Independent Test**: Aplicar filtros de tipo e periodo, confirmar que retorno respeita ambos e inclui datas de borda.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Criar componente de filtros da inadimplencia em `src/features/reports/components/delinquency-report-filters.tsx` (tipo + data inicial/final)
- [ ] T015 [US2] Conectar filtros da aba de inadimplencia ao estado de tela em `src/features/reports/components/reports-page.tsx`
- [ ] T016 [US2] Validar periodo invalido (`dataInicial > dataFinal`) com bloqueio de consulta e feedback ao usuario em `src/features/reports/components/delinquency-report-filters.tsx`
- [ ] T017 [US2] Garantir aplicacao combinada de filtros e periodo inclusivo no consumo da action em `src/features/reports/components/reports-page.tsx`
- [ ] T018 [US2] Exibir de forma consistente indicador de dias em atraso por cobranca no detalhe em `src/features/reports/components/delinquency-report-details.tsx`

**Checkpoint**: US2 funcional e validavel independentemente (CA-003, CA-003A, CA-004).

---

## Phase 5: User Story 3 - Exportar relatorio (Priority: P3)

**Goal**: Exportar CSV e PDF com recorte filtrado e auditoria de exportacao.

**Independent Test**: Com filtro aplicado, exportar CSV e PDF e confirmar consolidado+detalhado com os mesmos dados da tela e log de auditoria.

### Implementation for User Story 3

- [ ] T019 [US3] Criar endpoint CSV de inadimplencia em `src/app/api/reports/delinquency/route.ts` com RBAC e filtros
- [ ] T020 [US3] Criar endpoint PDF de inadimplencia em `src/app/api/reports/delinquency/pdf/route.ts` com RBAC e filtros
- [ ] T021 [P] [US3] Implementar serializacao CSV (consolidado + detalhado) reaproveitando utilitarios em `src/features/reports/server/csv-export.ts`
- [ ] T022 [P] [US3] Criar template PDF de inadimplencia (consolidado + detalhado) em `src/features/reports/components/pdf/delinquency-template.tsx`
- [ ] T023 [US3] Implementar `generateDelinquencyReportPDF(...)` em `src/features/reports/server/pdf-service.tsx`
- [ ] T024 [US3] Registrar auditoria de exportacao (somente exportacao) em `audit_logs` nos endpoints `src/app/api/reports/delinquency/route.ts` e `src/app/api/reports/delinquency/pdf/route.ts`
- [ ] T025 [US3] Adicionar botoes de exportacao CSV/PDF da aba inadimplencia em `src/features/reports/components/reports-page.tsx`
- [ ] T026 [US3] Implementar UX de falha imediata de exportacao com opcao de nova tentativa em `src/features/reports/components/reports-page.tsx`

**Checkpoint**: US3 funcional e validavel independentemente (CA-005, CA-008, CA-009).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechar consistencia de comportamento e validacao final.

- [ ] T027 [P] [Polish] Validar manualmente todos os criterios CA-001..CA-009 usando massa de dados controlada (documentar evidencias no PR)
- [ ] T028 [Polish] Executar `bun run lint` e corrigir pontos de estilo/tipagem nos arquivos alterados
- [ ] T029 [Polish] Revisar `src/config/nav-config.ts` para confirmar que a visibilidade de Relatorios continua bloqueando `org:member` sem regressao

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> inicia imediatamente
- Phase 2 -> depende da Phase 1 e bloqueia todas as user stories
- Phase 3 (US1) -> depende da Phase 2
- Phase 4 (US2) -> depende da Phase 2, pode iniciar apos US1 base de tela
- Phase 5 (US3) -> depende da Phase 2 e da base de filtros/dados de US1+US2
- Phase 6 -> depende das stories selecionadas concluidas

### User Story Dependencies

- **US1 (P1)**: primeira entrega MVP
- **US2 (P2)**: depende da base de exibicao de US1
- **US3 (P3)**: depende da consulta/recorte de US1+US2 para exportar dados consistentes

### Parallel Opportunities

- T001 e T002 em paralelo
- T009 e T010 em paralelo
- T014 e ajustes de tabela de US1 podem ser paralelizados por devs diferentes
- T021 e T022 em paralelo

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1 + Phase 2
2. Entregar US1
3. Validar CA-001, CA-002, CA-006, CA-007

### Incremental Delivery

1. US1 (visao consolidada)
2. US2 (filtros e detalhe de atraso)
3. US3 (exportacoes + auditoria)
4. Polish final
