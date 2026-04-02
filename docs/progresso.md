# Progresso — Sistema de Tesouraria UPJ Control

> Documento vivo de acompanhamento. Atualizado a cada parte concluída.

---

## Fase 1 — Base operacional

| Parte | Descrição                         | Status       | Data       |
| ----- | --------------------------------- | ------------ | ---------- |
| 1.1   | Infraestrutura base               | ✅ Concluída | 2026-03-24 |
| 1.2   | Autenticação e permissões (Clerk) | ✅ Concluída | 2026-03-25 |
| 1.3   | Cadastro de irmãos                | ✅ Concluída | 2026-03-25 |
| 1.4   | Tipos de cobrança                 | ✅ Concluída | 2026-03-25 |
| 1.5   | Cobranças manuais                 | ✅ Concluída | 2026-03-25 |
| 1.6   | Pagamentos e baixa                | ✅ Concluída | 2026-03-25 |

## Fase 2 — Portal e recorrência

| Parte | Descrição             | Status       | Data       |
| ----- | --------------------- | ------------ | ---------- |
| 2.1   | Extrato individual    | ✅ Concluída | 2026-03-25 |
| 2.2   | Geração de PDF        | ✅ Concluída | 2026-03-25 |
| 2.3   | Portal do irmão       | ✅ Concluída | 2026-03-26 |
| 2.4   | Cobranças recorrentes | ✅ Concluída | 2026-03-27 |

---

## Fase 3 — Financeiro gerencial

| Parte | Descrição                  | Status       | Data       |
| ----- | -------------------------- | ------------ | ---------- |
| 3.1   | Caixa geral da loja        | ✅ Concluída | 2026-03-30 |
| 3.2   | Relatórios financeiros     | ✅ Concluída | 2026-03-30 |
| 3.3   | Relatório de inadimplência | ✅ Concluída | 2026-03-30 |
| 3.4   | Auditoria reforçada        | ✅ Concluída | 2026-03-31 |

## Fase 4 — Automação e fechamento

| Parte | Descrição               | Status      | Data |
| ----- | ----------------------- | ----------- | ---- |
| 4.1   | Notificações por e-mail | ⬜ Pendente | —    |
| 4.2   | Fechamento mensal       | ⬜ Pendente | —    |
| 4.3   | Dashboard executivo     | ⬜ Pendente | —    |
| 4.4   | Integrações futuras     | ⬜ Pendente | —    |

---

## Log de entregas

### Parte 1.1 — Infraestrutura base

**Início:** 2026-03-24

- [x] Projeto Next.js com TypeScript (já existente via template)
- [x] ESLint + Prettier configurados (já existente via template)
- [x] Limpeza de módulos de exemplo (product, kanban, chat, billing, exclusive)
- [x] Criar estrutura de features da tesouraria (`members`, `charges`, `payments`, etc.)
- [x] Instalar e configurar Prisma ORM (v6 + @prisma/client + dotenv)
- [x] Criar `docker-compose.yml` para PostgreSQL (v16-alpine)
- [x] Criar schema Prisma com todos os modelos (Fases 1 a 4)
- [x] Gerar Prisma Client (`prisma generate`)
- [x] Criar singleton `src/lib/db.ts`
- [x] Atualizar variáveis de ambiente (`.env`, `.env.local`, `env.example.txt`)
- [x] Build validado (`npm run build` ✅)
- [x] Subir banco com `docker compose up -d` _(manual pelo dev)_
- [x] Rodar migration inicial `npx prisma migrate dev --name init` _(manual, requer Docker ativo)_

### Parte 2.2 — Geração de PDF

**Início:** 2026-03-25

- [x] Instalar @react-pdf/renderer
- [x] Criar serviço de geração de PDF (`pdf-service.tsx`)
- [x] Template Extrato Individual (estilo bancário)
- [x] Template Ficha Visual (estilo ficha física tradicional)
- [x] Endpoint de download (`GET /api/members/[id]/extrato`)
- [x] Suporte a parâmetros (`type=extrato` ou `type=ficha`)
- [x] Logs de auditoria para geração de relatórios
- [x] Botões de download integrados na visualização de extrato

### Parte 2.3 — Portal do irmão

**Início:** 2026-03-26

- [x] Configuração da role `org:member` no `nav-config.ts`
- [x] Server Actions isoladas por `clerk_user_id` em `portal.queries.ts`
- [x] Página principal do Portal (`/dashboard/portal`) com métricas resumidas e últimos pagamentos
- [x] Tabela de transações completa do membro usando `TanStack Table`
- [x] Botão para Baixar Extrato reaproveitado da API de relatórios

### Parte 2.4 — Cobranças recorrentes

**Início:** 2026-03-27

- [x] Expansão do schema `RecurringChargeRule` para suportar frequência e valores
- [x] Interface de gestão de regras integrada ao `ChargeTypeForm`
- [x] Nova página de **Lançamento Mensal** (`/dashboard/charges/recurring`)
- [x] Sistema de processamento em massa com validação de duplicidade
- [x] Integração com `nav-config.ts` e registro de ícones (`repeat`)
- [x] Proteção contra lançamentos em períodos encerrados
- [x] Logs de auditoria vinculados ao tesoureiro que disparou o lote

### Parte 3.1 — Caixa geral da loja

**Início:** 2026-03-29 (concluído em 2026-03-30)

- [x] Tabela `cash_transactions` no Prisma (entradas e saídas)
- [x] Interface de listagem de transações com filtros de data
- [x] Cards de resumo financeiro (Saldo total, Entradas, Saídas)
- [x] Sincronização de filtros com a URL via `nuqs`
- [x] Formulário de "Novo Lançamento" funcional
- [x] Proteção de rota e RBAC (diretoria e tesoureiro apenas)
- [x] Correção de bugs de re-fetch nos filtros e paginação

### Parte 3.2 — Relatórios financeiros

**Início:** 2026-03-30

- [x] Módulo central de relatórios (`/dashboard/reports`)
- [x] Query de Receitas (agrupado por método de pagamento e categoria)
- [x] Query de Despesas (agrupado por categoria)
- [x] Saldo Consolidado (Entradas - Saídas)
- [x] Posição Financeira por Membro (Total cobrado vs Total pago)
- [x] Gráfico de Receitas por Tipo de Cobrança
- [x] Exportação de relatórios em CSV e PDF (templates `report`, `statement`, `ficha`)
- [x] Filtros globais de período integrados com as queries

### Parte 3.3 — Relatório de inadimplência

**Início:** 2026-03-30

- [x] Aba de inadimplência integrada ao módulo `/dashboard/reports`
- [x] Listagem de irmãos com cobranças `pendente` e `due_date < hoje`
- [x] Consolidado por irmão (nome, quantidade vencidas, total em aberto, cobrança mais antiga)
- [x] Filtros por tipo de cobrança e período de vencimento (intervalo inclusivo)
- [x] Indicador de dias em atraso por cobrança
- [x] Exportação do recorte para CSV e PDF (consolidado + detalhado)
- [x] Auditoria de exportações em `audit_logs`
- [x] RBAC aplicado: `org:treasurer`, `org:manager`, `org:admin`; bloqueio de `org:member` (403)

### Parte 3.4 — Auditoria reforçada

**Início:** 2026-03-31

- [x] Estrutura de auditoria evoluída com `org_id` e índices para consulta
- [x] Utilitário central de escrita de logs (`audit-log-writer`) criado
- [x] Cobertura de eventos críticos em cobranças e pagamentos com snapshots old/new
- [x] Gancho de evento `role.permission_changed` e `period.closed` adicionado
- [x] Nova área `/dashboard/audit-logs` com filtros por usuário, ação e período
- [x] API de listagem/detalhe de logs com paginação e isolamento por organização
- [x] Bloqueio explícito para `org:member` e logs em modo somente leitura
