# Implementation Plan: Relatorio de Inadimplencia (Parte 3.3)

**Branch**: `[001-inadimplencia-report]` | **Date**: 2026-03-30 | **Spec**: `/specs/001-inadimplencia-report/spec.md`
**Input**: Feature specification from `/specs/001-inadimplencia-report/spec.md`

## Summary

Implementar o relatorio de inadimplencia dentro do modulo de relatorios financeiros existente, com foco em: consolidacao por irmao, filtros por tipo e periodo de vencimento (inclusive nas bordas), indicador de dias em atraso, exportacoes CSV/PDF com consolidado + detalhado, auditoria de exportacao e RBAC com bloqueio explicito para `org:member` (403).

A estrategia tecnica reutiliza os padroes atuais do UPJ: rota de dashboard em App Router, modulo feature-based em `src/features/reports`, server actions com Prisma para consulta consolidada, rotas API para exportacao e controles de acesso duplicados (pagina + server action + endpoint de exportacao).

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), React 19, Next.js App Router 16  
**Primary Dependencies**: Next.js, Prisma Client, Clerk, shadcn/ui, @react-pdf/renderer  
**Storage**: PostgreSQL via Prisma (`charges`, `members`, `charge_types`, `audit_logs`)  
**Testing**: Validacao por cenarios Given/When/Then da spec + lint (`next lint`) + testes unitarios focados em utilitarios de consolidacao/formatacao  
**Target Platform**: Aplicacao web (dashboard interno)  
**Project Type**: Web application monolitica (frontend + rotas server/API no mesmo projeto)  
**Performance Goals**: Consulta filtrada em ate 3s para 10k cobrancas vencidas; exportacao em ate 10s para 5k linhas  
**Constraints**: Escopo fechado ao item 3.3; sem alteracoes em cobranca/pagamento; sem processamento assincrono de exportacao; `org:member` sempre bloqueado  
**Scale/Scope**: 1 nova visao de relatorio dentro de `Relatorios`; 1 fluxo de consulta + 2 exportacoes + auditoria associada

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Arquivo de constituicao em `.specify/memory/constitution.md` esta em formato placeholder (sem regras ativas de governanca).
- Gate considerado **PASS** usando as convencoes do repositório (AGENTS.md + padroes existentes do modulo de relatorios).
- Re-check apos design: manter sem violacoes (sem nova stack, sem quebra de padrao estrutural).

## Project Structure

### Documentation (this feature)

```text
specs/001-inadimplencia-report/
├── plan.md
├── spec.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── dashboard/
│   │   └── reports/
│   │       └── page.tsx                        # RBAC de entrada na pagina
│   └── api/
│       └── reports/
│           ├── delinquency/
│           │   └── route.ts                    # Exportacao CSV inadimplencia
│           └── delinquency/
│               └── pdf/
│                   └── route.ts                # Exportacao PDF inadimplencia
├── features/
│   └── reports/
│       ├── components/
│       │   ├── reports-page.tsx                # Adiciona aba/fluxo inadimplencia
│       │   ├── delinquency-report-table.tsx    # Consolidado por irmao
│       │   ├── delinquency-report-filters.tsx  # Tipo + periodo vencimento
│       │   └── pdf/
│       │       └── delinquency-template.tsx    # PDF com consolidado + detalhado
│       └── server/
│           ├── report.actions.ts               # getDelinquencyReport + RBAC
│           ├── csv-export.ts                   # Reuso/ajuste para formato novo
│           └── pdf-service.tsx                 # generateDelinquencyReportPDF
├── config/
│   └── nav-config.ts                           # So se for necessario ajuste de visibilidade
└── lib/
    └── db.ts
```

**Structure Decision**: manter o relatorio de inadimplencia no modulo `src/features/reports` e na rota existente `src/app/dashboard/reports/page.tsx`, evitando nova secao de menu e maximizando reuso de componentes, server actions e export services ja padronizados.

## Implementation Phases

### Phase 1 - Domain e Consulta (server actions + regras)

1. Adicionar no `report.actions.ts` uma action dedicada ao relatorio de inadimplencia com:
   - validacao de RBAC (`org:treasurer`, `org:manager`, `org:admin`; negar `org:member`)
   - filtro por tipo de cobranca
   - filtro por periodo de vencimento com limites inclusivos
   - recorte por organizacao ativa
   - consolidacao por irmao: nome, qtd vencidas, total aberto, cobranca mais antiga
   - detalhamento por cobranca com dias em atraso
2. Padronizar calculo monetario para exibicao/exportacao em 2 casas (half-up) no ponto de serializacao.
3. Garantir tratamento de erros retornando objeto `success/error` coerente com os demais reports.

### Phase 2 - UI de Relatorio (dashboard)

1. Evoluir `reports-page.tsx` para incluir aba/visao de inadimplencia.
2. Criar componentes de filtros dedicados (tipo + periodo) e tabela consolidada com expansao/detalhe por cobranca.
3. Exibir estados: carregando, vazio, erro e sucesso.
4. Implementar validacao de periodo invalido (`dataInicial > dataFinal`) com bloqueio de consulta.
5. Garantir que `org:manager` tenha apenas leitura/exportacao (sem atalhos de acao operacional).

### Phase 3 - Exportacoes e Auditoria

1. Criar endpoint CSV: `/api/reports/delinquency`.
2. Criar endpoint PDF: `/api/reports/delinquency/pdf`.
3. Ambos devem:
   - reaplicar RBAC
   - reutilizar os mesmos filtros ativos da tela (tipo + periodo)
   - gerar conteudo com duas secoes: consolidado por irmao e detalhado por cobranca
   - retornar erro imediato em falha, com possibilidade de nova tentativa na UI
4. Registrar auditoria somente em exportacoes (`audit_logs`), incluindo usuario, org, formato e filtros.

### Phase 4 - Hardening e Validacao Final

1. Revisar codigos HTTP de negacao para atender decisao de clarificacao (`403` para `org:member`).
2. Validar cenarios de borda definidos na spec (due_date hoje, periodo inclusivo, valor zero, erro de exportacao).
3. Rodar `next lint` e checks locais de regressao no modulo de relatorios.

## RBAC and Security Plan

- **Camada pagina (`/dashboard/reports`)**: manter bloqueio de `org:member` com negacao explicita.
- **Camada server action (`report.actions.ts`)**: validar papel permitido antes de consultar dados.
- **Camada API exportacao**: validar novamente papel e org ativa; nunca confiar apenas na UI.
- **Isolamento de dados**: consultas e exportacoes sempre restritas ao contexto da organizacao ativa.
- **CSV safety**: manter sanitizacao anti formula injection em `csv-export.ts`.

## Data and Query Plan

- Fonte principal: `charges` (status/due_date/amount) com joins para `members` (nome) e `charge_types` (tipo).
- Filtro base de inadimplencia: `status = pendente` e `due_date < hoje (fuso da organizacao)`.
- Filtros adicionais: `chargeTypeId` opcional e intervalo de `dueDate` inclusivo.
- Consolidacao por irmao: agregacoes de contagem, soma e menor `dueDate`.
- Detalhamento: lista de cobrancas vencidas por irmao com `daysOverdue`.
- Sem mudanca obrigatoria de schema para MVP; se necessario para performance, avaliar indice composto em `charges(status, due_date, member_id, charge_type_id)` em etapa posterior.

## Error Handling Plan

- Consulta:
  - periodo invalido -> bloqueio com mensagem orientativa
  - falha interna -> mensagem de erro + acao "tentar novamente"
- Exportacao:
  - falha imediata (sem job assincrono)
  - manter filtros na tela para retry
- Acesso negado:
  - `org:member` -> resposta 403 + mensagem explicativa

## Validation Strategy

- Mapear testes manuais pelos criterios `CA-001` a `CA-009` da spec.
- Adicionar testes unitarios para:
  - calculo de `daysOverdue`
  - aplicacao de periodo inclusivo
  - serializacao monetaria em 2 casas (half-up)
  - montagem de payload de exportacao (consolidado + detalhado)
- Validar auditoria de exportacao com verificacao direta em `audit_logs`.

## Risks and Mitigations

- **Risco**: timezone incorreto afetar classificacao de vencidas.  
  **Mitigacao**: centralizar funcao de "hoje" por organizacao e cobrir com testes de fronteira.
- **Risco**: inconsistencias entre tela e exportacao.  
  **Mitigacao**: gerar exportacao a partir da mesma action/filtro usado na tela.
- **Risco**: degradacao em base grande.  
  **Mitigacao**: priorizar agregacoes no banco e limitar campos trafegados.

## Complexity Tracking

Sem violacoes a justificar no estado atual.
