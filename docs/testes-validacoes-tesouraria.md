# Testes e Validações — Correções do Plano de Tesouraria

> Documento operacional para validar as correções aplicadas em `docs/plano-criacao-tesouraria.md`.
> Foco: RBAC canônico, multi-tenant, integridade financeira, App Router e consistência de arquitetura.

---

## Escopo validado

- Unificação de papéis e permissões canônicas do Clerk
- Multi-tenant obrigatório com `org_id` desde a Fase 1
- Estratégia monetária em centavos (`BIGINT`)
- Anti-duplicata de recorrência com constraint em banco
- Estorno com reversão rastreável e recálculo de status
- Ajuste de serviço e endpoint PDF para padrão do App Router
- Padronização de comandos de build/lint com Bun

---

## Pré-requisitos de ambiente

- Dependências instaladas: `bun install`
- Banco local em execução: `docker compose up -d`
- Migrations aplicáveis: `bunx prisma migrate dev`
- Variáveis de ambiente mínimas configuradas em `.env.local`

---

## Validações obrigatórias por tema

### 1) RBAC canônico (Clerk)

**Objetivo:** garantir que apenas `org:admin`, `org:treasurer`, `org:manager` e `org:member` sejam usados como papéis técnicos.

**Checklist:**

- Confirmar ausência de verificações de papel não canônicas no backend
- Confirmar mapeamento explícito de permissões funcionais (`portal.self.read`, `charges.manage`, etc.)
- Validar que telas e ações respeitam role + permission

**Cenários mínimos:**

- `org:member` acessa somente o próprio portal
- `org:manager` visualiza relatórios, mas não cria/edita lançamentos
- `org:treasurer` cria cobranças e registra pagamentos
- `org:admin` acessa todas as áreas administrativas

---

### 2) Isolamento multi-tenant (`org_id`)

**Objetivo:** impedir vazamento de dados entre organizações.

**Checklist:**

- Confirmar `org_id` em todas as tabelas de domínio
- Confirmar filtros por `org_id` em todas as queries de leitura/escrita
- Confirmar índices compostos com `org_id` nas buscas principais

**Cenários mínimos:**

- Usuário da organização A não consegue ler/alterar dados da organização B
- APIs retornam `403` ou `404` para recursos fora do tenant autenticado
- Exportações (PDF/CSV) incluem somente dados do tenant atual

---

### 3) Integridade monetária (centavos)

**Objetivo:** eliminar inconsistência por arredondamento.

**Checklist:**

- Confirmar campos `amount_*_cents` com tipo inteiro no schema
- Confirmar conversão única de entrada/saída (UI <-> banco)
- Confirmar exibição formatada em moeda somente na camada de apresentação

**Cenários mínimos:**

- Soma de múltiplos lançamentos mantém precisão exata
- Pagamento parcial atualiza saldo sem resíduos decimais
- Créditos excedentes atualizam `credit_balance_cents` corretamente

---

### 4) Anti-duplicata de recorrência

**Objetivo:** impedir cobrança duplicada no mesmo membro/tipo/competência.

**Checklist:**

- Confirmar constraint única no banco: `UNIQUE(org_id, member_id, charge_type_id, competence_date)`
- Confirmar tratamento de erro amigável no backend para violação de constraint
- Confirmar idempotência da ação de geração mensal

**Cenários mínimos:**

- Primeira geração da competência cria cobranças
- Segunda execução para a mesma competência não duplica registros
- Execuções concorrentes mantêm consistência (sem duplicação)

---

### 5) Estorno com rastreabilidade

**Objetivo:** estornar sem apagar histórico e recalcular status da cobrança.

**Checklist:**

- Confirmar `payment_allocations` com campos de reversão (`reversed_at`, `reversed_by`, `reversal_reason`)
- Confirmar ausência de deleção física em estornos
- Confirmar recálculo de status por total alocado ativo

**Cenários mínimos:**

- Estorno total volta cobrança para `pendente`
- Estorno parcial mantém ou volta para `parcialmente_paga` conforme saldo
- Auditoria registra estado anterior e novo estado

---

### 6) PDF no App Router

**Objetivo:** padronizar geração e download de PDF no Next.js App Router.

**Checklist:**

- Confirmar serviço em `src/features/reports/server/pdf.service.ts`
- Confirmar route handler em `src/app/api/members/[id]/extrato/route.ts`
- Confirmar retorno com `Content-Type: application/pdf`

**Cenários mínimos:**

- `org:treasurer` baixa extrato de membro do mesmo tenant
- `org:member` baixa apenas o próprio extrato
- Usuário sem permissão recebe `403`

---

### 7) Consistência de build e qualidade

**Objetivo:** garantir fluxo padrão com Bun e pipeline verde.

**Comandos de validação:**

```bash
bun run lint
bun run build
```

**Resultado esperado:**

- Sem erros de lint bloqueantes
- Build de produção concluído com sucesso

---

## Testes de regressão recomendados

- Cadastro e vínculo de membro com whitelist (e-mail + CIM)
- Criação de cobrança manual e em lote
- Registro de pagamento com FIFO e alocação manual
- Portal do irmão com isolamento total de dados
- Relatórios e exportações respeitando permissões e tenant
- Log de auditoria para todas as ações críticas

---

## Critério final de aceite

As correções são consideradas aceitas quando:

- Todos os checklists deste documento estiverem concluídos
- Cenários mínimos obrigatórios passarem em ambiente local
- `bun run lint` e `bun run build` passarem sem erro
- Não houver vazamento cross-tenant nem duplicidade de recorrência
- Estornos preservarem trilha histórica e recalcularem status corretamente
