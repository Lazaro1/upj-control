# Tasks: Auditoria Reforcada (Parte 3.4)

**Input**: Design documents from `/specs/002-auditoria-reforcada/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Nao ha exigencia de TDD no escopo; validacao principal por criterios CA-001..CA-010 e quickstart.

**Organization**: Tasks agrupadas por user story para permitir entrega incremental e validacao independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependencia de tarefa incompleta)
- **[Story]**: `US1`, `US2`, `US3` (somente fases de user story)
- Todas as tarefas incluem caminho(s) de arquivo explicitos

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura da feature e ponto unico de padronizacao para auditoria.

- [x] T001 Criar modulo base de auditoria em `src/features/audit-logs/server/audit-log-writer.ts`
- [x] T002 [P] Criar schemas de filtro da auditoria em `src/features/audit-logs/schemas/audit-log-filter.schema.ts`
- [x] T003 [P] Criar estrutura inicial de listagem em `src/features/audit-logs/components/audit-log-listing.tsx`
- [x] T004 [P] Criar rota inicial da pagina de auditoria em `src/app/dashboard/audit-logs/page.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base de dados, contratos e seguranca obrigatoria para todas as stories.

**CRITICAL**: Nenhuma story deve iniciar antes deste bloco.

- [x] T005 Ajustar modelo de auditoria para incluir `org_id` em `prisma/schema.prisma`
- [x] T006 Criar migration de `org_id` e indices de consulta em `prisma/migrations/*_audit_logs_org_id/migration.sql`
- [x] T007 Implementar utilitario de escrita padronizada (action/entity/snapshots) em `src/features/audit-logs/server/audit-log-writer.ts`
- [x] T008 [P] Implementar query server-side paginada de logs por `org_id` em `src/features/audit-logs/server/audit-log.actions.ts`
- [x] T009 [P] Implementar query server-side de detalhe por `id` + `org_id` em `src/features/audit-logs/server/audit-log.actions.ts`
- [x] T010 Implementar endpoint de lista com filtros/paginacao em `src/app/api/audit-logs/route.ts`
- [x] T011 Implementar endpoint de detalhe de log em `src/app/api/audit-logs/[id]/route.ts`
- [x] T012 Reforcar RBAC dos endpoints de auditoria (403 para `org:member`) em `src/app/api/audit-logs/route.ts`
- [x] T013 Reforcar RBAC dos endpoints de auditoria (403 para `org:member`) em `src/app/api/audit-logs/[id]/route.ts`

**Checkpoint**: Fundacao pronta para stories independentes.

---

## Phase 3: User Story 1 - Registrar trilha confiavel de eventos criticos (Priority: P1) 🎯 MVP

**Goal**: Cobrir e padronizar todos os eventos criticos obrigatorios com trilha old/new adequada.

**Independent Test**: Executar `charge.created/updated/cancelled`, `payment.created/allocated/reversed` e validar cada log com campos obrigatorios e snapshots corretos.

### Implementation for User Story 1

- [x] T014 [US1] Refatorar criacao de auditoria de cobrancas para utilitario padronizado em `src/features/charges/server/charge.actions.ts`
- [x] T015 [US1] Incluir `org_id` e snapshots obrigatorios nos eventos de cobranca em `src/features/charges/server/charge.actions.ts`
- [x] T016 [US1] Refatorar criacao de auditoria de pagamento para utilitario padronizado em `src/features/payments/server/payment.actions.ts`
- [x] T017 [US1] Registrar evento `payment.allocated` com `entity_type=payment_allocation` em `src/features/payments/server/payment.actions.ts`
- [x] T018 [US1] Garantir evento `payment.reversed` com old/new quando aplicavel em `src/features/payments/server/payment.actions.ts`
- [x] T019 [US1] Padronizar evento de permissao `role.permission_changed` em `src/features/members/server/member.actions.ts`
- [x] T020 [US1] Adicionar gancho de auditoria para `period.closed` quando fluxo existir em `src/features/period-closing/server/period-closing.actions.ts`
- [x] T021 [US1] Atualizar auditorias existentes para incluir `org_id` em `src/features/cash-transactions/server/cash-transaction.actions.ts`
- [x] T022 [US1] Atualizar auditorias existentes para incluir `org_id` em `src/features/charges/server/recurring-charges.actions.ts`

**Checkpoint**: US1 pronta e validavel por CA-001..CA-004.

---

## Phase 4: User Story 2 - Consultar historico de auditoria por filtros (Priority: P2)

**Goal**: Disponibilizar tela de auditoria com filtros por usuario, acao e periodo, lista paginada e detalhe old/new.

**Independent Test**: Abrir `/dashboard/audit-logs`, aplicar filtros isolados/combinados e validar resultado e detalhe.

### Implementation for User Story 2

- [x] T023 [US2] Implementar componente de filtros (usuario, acao, periodo) em `src/features/audit-logs/components/audit-log-filters.tsx`
- [x] T024 [US2] Implementar tabela paginada de logs com colunas obrigatorias em `src/features/audit-logs/components/audit-log-listing.tsx`
- [x] T025 [US2] Implementar drawer/modal de detalhe old/new em `src/features/audit-logs/components/audit-log-details-drawer.tsx`
- [x] T026 [US2] Integrar filtros e paginacao com URL state em `src/features/audit-logs/components/audit-log-listing.tsx`
- [x] T027 [US2] Implementar estado vazio e erro na listagem em `src/features/audit-logs/components/audit-log-listing.tsx`
- [x] T028 [US2] Compor pagina final da feature de auditoria em `src/app/dashboard/audit-logs/page.tsx`
- [x] T029 [US2] Registrar rota de auditoria na navegacao em `src/config/nav-config.ts`

**Checkpoint**: US2 pronta e validavel por CA-005..CA-007.

---

## Phase 5: User Story 3 - Proteger acesso e integridade dos logs (Priority: P3)

**Goal**: Garantir acesso somente para papeis permitidos e imutabilidade operacional dos logs.

**Independent Test**: Validar acesso autorizado, bloqueio `org:member`, isolamento por organizacao e ausencia de acoes de alteracao/exclusao.

### Implementation for User Story 3

- [x] T030 [US3] Aplicar gate de acesso da pagina para `org:treasurer|org:manager|org:admin` em `src/app/dashboard/audit-logs/page.tsx`
- [x] T031 [US3] Implementar pagina de acesso negado explicita para auditoria em `src/app/dashboard/audit-logs/forbidden.tsx`
- [x] T032 [US3] Garantir isolamento por `org_id` na listagem de logs em `src/features/audit-logs/server/audit-log.actions.ts`
- [x] T033 [US3] Garantir isolamento por `org_id` no detalhe de log em `src/features/audit-logs/server/audit-log.actions.ts`
- [x] T034 [US3] Remover/impedir qualquer acao de update/delete de logs na UI em `src/features/audit-logs/components/audit-log-listing.tsx`
- [x] T035 [US3] Bloquear metodos nao permitidos (PUT/PATCH/DELETE) na API em `src/app/api/audit-logs/[id]/route.ts`

**Checkpoint**: US3 pronta e validavel por CA-008..CA-010.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final, documentacao e estabilidade.

- [x] T036 [P] Atualizar progresso da fase 3.4 em `docs/progresso.md`
- [x] T037 Executar validacao completa do quickstart em `specs/002-auditoria-reforcada/quickstart.md`
- [x] T038 Executar verificacao de tipos e corrigir regressao em `src/features/audit-logs/server/audit-log.actions.ts`
- [x] T039 Revisar padrao de mensagens PT-BR na feature em `src/features/audit-logs/components/audit-log-listing.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: inicia imediatamente
- **Phase 2 (Foundational)**: depende da Phase 1 e bloqueia todas as stories
- **Phase 3 (US1)**: depende da Phase 2
- **Phase 4 (US2)**: depende da Phase 2
- **Phase 5 (US3)**: depende da Phase 2 e integra com outputs de US2 para bloqueios de UI
- **Phase 6 (Polish)**: depende das stories selecionadas concluidas

### User Story Dependencies

- **US1 (P1)**: independente apos fundacao; define MVP funcional de rastreabilidade.
- **US2 (P2)**: independente apos fundacao; usa os logs gerados por US1 para consulta.
- **US3 (P3)**: depende da base de consulta (US2) para validar bloqueio/imutabilidade ponta a ponta.

### Dependency Graph

- Setup -> Foundational -> {US1, US2} -> US3 -> Polish

### Within Each User Story

- Primeiro implementar camada server (acoes/queries)
- Depois API/integração
- Depois UI/UX final
- Validar criterios da story antes de seguir

### Parallel Opportunities

- **Setup**: T002, T003, T004 em paralelo
- **Foundational**: T008 e T009 em paralelo; T012 e T013 em paralelo
- **US1**: T014 e T016 em paralelo; T021 e T022 em paralelo
- **US2**: T023, T024 e T025 em paralelo
- **US3**: T032 e T033 em paralelo

---

## Parallel Example: User Story 1

```bash
# Cobertura de eventos em modulos diferentes
Task: "T014 [US1] Refatorar auditoria de charge em src/features/charges/server/charge.actions.ts"
Task: "T016 [US1] Refatorar auditoria de payment em src/features/payments/server/payment.actions.ts"

# Ajustes de auditoria existentes
Task: "T021 [US1] Atualizar cash transactions em src/features/cash-transactions/server/cash-transaction.actions.ts"
Task: "T022 [US1] Atualizar recurring charges em src/features/charges/server/recurring-charges.actions.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T023 [US2] Implementar filtros em src/features/audit-logs/components/audit-log-filters.tsx"
Task: "T024 [US2] Implementar tabela em src/features/audit-logs/components/audit-log-listing.tsx"
Task: "T025 [US2] Implementar detalhe em src/features/audit-logs/components/audit-log-details-drawer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 e Phase 2
2. Concluir US1 (Phase 3)
3. Validar CA-001..CA-004
4. Demonstrar rastreabilidade de eventos criticos

### Incremental Delivery

1. Entregar US1 (rastreabilidade)
2. Entregar US2 (consulta operacional)
3. Entregar US3 (bloqueio e integridade)
4. Fechar com Polish

### Suggested MVP Scope

- MVP recomendado: **Phase 1 + Phase 2 + Phase 3 (US1)**
- Valor entregue no MVP: garantia de trilha auditavel completa para operacoes criticas.

---

## Notes

- Todas as tarefas seguem formato de checklist com ID sequencial, labels e caminhos de arquivo.
- Marcador `[P]` aplicado apenas em tarefas sem dependencia direta entre si.
- Tarefa com `period.closed` (T020) deve ser condicionada a existencia do fluxo da Fase 4 no projeto.
