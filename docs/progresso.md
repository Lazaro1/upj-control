# Progresso — Sistema de Tesouraria UPJ Control

> Documento vivo de acompanhamento. Atualizado a cada parte concluída.

---

## Fase 1 — Base operacional

| Parte | Descrição | Status | Data |
|-------|-----------|--------|------|
| 1.1 | Infraestrutura base | ✅ Concluída | 2026-03-24 |
| 1.2 | Autenticação e permissões (Clerk) | ✅ Concluída | 2026-03-25 |
| 1.3 | Cadastro de irmãos | ✅ Concluída | 2026-03-25 |
| 1.4 | Tipos de cobrança | ✅ Concluída | 2026-03-25 |
| 1.5 | Cobranças manuais | ✅ Concluída | 2026-03-25 |
| 1.6 | Pagamentos e baixa | ✅ Concluída | 2026-03-25 |

## Fase 2 — Portal e recorrência

| Parte | Descrição | Status | Data |
|-------|-----------|--------|------|
| 2.1 | Extrato individual | ✅ Concluída | 2026-03-25 |
| 2.2 | Geração de PDF | ✅ Concluída | 2026-03-25 |
| 2.3 | Portal do irmão | ⬜ Pendente | — |
| 2.4 | Cobranças recorrentes | ⬜ Pendente | — |

## Fase 3 — Financeiro gerencial

| Parte | Descrição | Status | Data |
|-------|-----------|--------|------|
| 3.1 | Caixa geral da loja | ⬜ Pendente | — |
| 3.2 | Relatórios financeiros | ⬜ Pendente | — |
| 3.3 | Relatório de inadimplência | ⬜ Pendente | — |
| 3.4 | Auditoria reforçada | ⬜ Pendente | — |

## Fase 4 — Automação e fechamento

| Parte | Descrição | Status | Data |
|-------|-----------|--------|------|
| 4.1 | Notificações por e-mail | ⬜ Pendente | — |
| 4.2 | Fechamento mensal | ⬜ Pendente | — |
| 4.3 | Dashboard executivo | ⬜ Pendente | — |
| 4.4 | Integrações futuras | ⬜ Pendente | — |

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
- [x] Subir banco com `docker compose up -d` *(manual pelo dev)*
- [x] Rodar migration inicial `npx prisma migrate dev --name init` *(manual, requer Docker ativo)*

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
