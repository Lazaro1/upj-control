# Plano de Criação — Sistema de Tesouraria da Loja Maçônica

> Documento de referência para desenvolvimento por fases e partes.
> Baseado no PRD aprovado com incorporação das sugestões de arquitetura.

---

## Sumário

- [Visão geral do plano](#visão-geral-do-plano)
- [Fase 1 — Base operacional](#fase-1--base-operacional)
- [Fase 2 — Portal e recorrência](#fase-2--portal-e-recorrência)
- [Fase 3 — Financeiro gerencial](#fase-3--financeiro-gerencial)
- [Fase 4 — Automação e fechamento](#fase-4--automação-e-fechamento)
- [Dependências entre partes](#dependências-entre-partes)
- [Decisões técnicas obrigatórias](#decisões-técnicas-obrigatórias)

---

## Visão geral do plano

| Fase | Nome                   | Duração estimada | Prioridade                      |
| ---- | ---------------------- | ---------------- | ------------------------------- |
| 1    | Base operacional       | 8–10 semanas     | Crítica — pré-requisito de tudo |
| 2    | Portal e recorrência   | 5–7 semanas      | Alta — entrega valor ao irmão   |
| 3    | Financeiro gerencial   | 4–6 semanas      | Média — visão da diretoria      |
| 4    | Automação e fechamento | 4–5 semanas      | Baixa — conforto operacional    |

**Princípio geral:** cada fase só pode iniciar quando todas as partes da fase anterior estiverem funcionais e testadas. A única exceção permitida é iniciar a Fase 2 enquanto ajustes finais da Fase 1 ainda estão em andamento, desde que as Partes 1.2, 1.3, 1.5 e 1.6 estejam concluídas.

**Convenções obrigatórias para implementação:**

- **Package manager oficial:** Bun (`bun install`, `bun run build`, `bun run lint`)
- **Papel canônico no Clerk:** `org:admin`, `org:treasurer`, `org:manager`, `org:member`
- **Permissões canônicas (exemplos):** `portal.self.read`, `members.manage`, `charges.manage`, `payments.manage`, `reports.read`
- **Modelo multi-tenant:** todas as entidades de negócio devem incluir `org_id` desde a Fase 1
- **Regra de valores monetários (MVP):** armazenar valores em centavos (`BIGINT`) para evitar erros de arredondamento

---

## Fase 1 — Base operacional

> Pré-requisito absoluto de todo o sistema. Nenhuma outra fase funciona sem esta.

---

### Parte 1.1 — Infraestrutura base

**Objetivo:** criar o esqueleto técnico do projeto com qualidade suficiente para crescer sem reescrita.

**Tarefas:**

- Inicializar projeto Next.js com TypeScript
- Configurar ESLint, Prettier e regras de lint
- Adaptar para estrutura de features baseada na template Next.js Admin Dashboard Starter:
  ```
  /src/features
    /members
    /charges
    /payments
    /reports
    /member-portal
    /dashboard-executivo
  ```
- Cada feature deve utilizar os recursos da template com as pastas orientadas ao framework: `components/`, `server/` (actions/queries), `hooks/`, `schemas/`, `types/`
- Configurar PostgreSQL local (Docker Compose recomendado)
- Instalar e configurar Prisma ORM
- Criar migration inicial vazia validada
- Configurar variáveis de ambiente (`.env.local`, `.env.example`)
- Configurar pipeline de CI básico (lint + build)
- Adicionar campo `updated_at` como padrão em todos os modelos do schema Prisma
- Definir tipo monetário padrão em schema Prisma como centavos (`BIGINT`) para `amount` e campos derivados de saldo

**Critério de conclusão:** `bun run build` passa sem erros, banco sobe com `docker compose up`, migration roda com `prisma migrate dev`.

---

### Parte 1.2 — Autenticação e permissões (via Clerk)

**Objetivo:** permitir login seguro com controle de acesso por papéis utilizando o Clerk, que já vem embutido na template atual.

**Tarefas:**

- Aproveitar a integração já estabelecida do Clerk na `Next.js Admin Dashboard Starter`
- Configurar _Clerk Organizations_ e _Clerk Roles/Permissions_ no painel de administração da plataforma (RBAC nativo)
- **Configurar Restrição de Cadastro (Whitelist):** permitir apenas usuários cujos e-mails já estejam previamente cadastrados na base de Membros da Tesouraria.
- Fazer a validação server-side com `auth()` do Clerk, bloqueando rotas ou chamadas no Prisma dependendo da permissão
- Renderização condicional client-side usando `useOrganization()` ou o componente `<Protect>` nativo para ocultar botões e links
- (Opcional) Usar Webhooks do Clerk internamente para manter um log mínimo se exigido, embora não seja estritamente necessário já que os metadados podem cruzar com `userId` do Clerk
- Criar matriz de acesso única mapeando papéis do Clerk para permissões funcionais do sistema (sem aliases soltos)

**Papéis canônicos dentro do Clerk (Roles):**

| Papel (Role)    | Permissões esperadas                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| `org:admin`     | Controle total do sistema, ajustes nas regras multi-lojas e setup de relatórios. |
| `org:treasurer` | Criar membros, gerar cobranças, dar baixa em boletos, acessar base do portal.    |
| `org:manager`   | Visualizar dashboard e extrair relatórios (somente-leitura nas movimentações).   |
| `org:member`    | Acesso limitado unicamente ao Portal Individual para prestação de contas.        |

**Nomes de negócio e mapeamento técnico:**

- `admin` -> `org:admin`
- `tesoureiro` -> `org:treasurer`
- `diretoria` -> `org:manager`
- `irmão` -> `org:member`

**Critério de conclusão:** Autenticação é garantida pelo Clerk sem necessidade de gerenciar senhas ou sessões na nossa DB local (`users`). A RBAC funciona restringindo acessos e o painel filtra visibilidade dependendo das 'permissions' providas na Org.

---

### Parte 1.3 — Cadastro de irmãos

**Objetivo:** permitir cadastro completo e gestão da base de membros.

**Tarefas:**

- Criar tabela:
  ```
  members (id, org_id, cim, clerk_user_id (opcional), full_name, email, phone, status, joined_at, notes_internal, credit_balance_cents, created_at, updated_at)
  ```
  _(Nota: Em vez de criar vínculo local rígido com usuários, a chave primária de login será o `clerk_user_id`)_
- Desenvolvimento da página de membros listando a tabela usando o componente `TanStack Table` em conjunto com a UI `shadcn` já pré-configurada.
- Listagem com busca por nome/e-mail e filtro por status
- Campo `notes_internal` deve ser visível apenas para `tesoureiro` e `admin` — nunca exposto ao portal do irmão
- Tela de vínculo: associar um registro da base de irmãos no banco local a um e-mail do sistema Clerk (para acesso ao Portal) utilizando Email + CIM para maior segurança.
- Validação: e-mail e CIM únicos, campos obrigatórios
- Constraints por tenant: `UNIQUE(org_id, email)` e `UNIQUE(org_id, cim)`
- Auditoria: registrar criação e edição em `audit_logs`

**Status possíveis de membro:** `ativo`, `inativo`, `licenciado`, `remido`

**Critério de conclusão:** tesoureiro consegue cadastrar, editar e buscar irmãos. `notes_internal` não aparece em nenhum endpoint acessível pelo papel `org:member`.

---

### Parte 1.4 — Tipos de cobrança

**Objetivo:** parametrizar as categorias de cobrança da loja.

**Tarefas:**

- Criar tabela:
  ```
  charge_types (id, org_id, name, description, default_amount_cents, is_recurring, active, created_at, updated_at)
  ```
- CRUD de tipos de cobrança
- Flag `is_recurring` sinaliza que o tipo pode ser usado em regras recorrentes (Fase 2)
- Flag `active` permite desativar sem excluir
- Seed inicial com exemplos:
  - Mensalidade (recorrente, valor padrão configurável)
  - Taxa GOB/MG (recorrente)
  - Taxa GOB/BR (recorrente)
  - Evento (não recorrente)
  - Contribuição extraordinária (não recorrente)
  - Multa (não recorrente)
  - Desconto (não recorrente, valor negativo permitido)
  - Isenção (não recorrente, valor zero)

**Critério de conclusão:** admin e tesoureiro conseguem criar e desativar tipos. Tipos inativos não aparecem na criação de cobranças.

---

### Parte 1.5 — Cobranças manuais

**Objetivo:** permitir geração de cobranças individuais e em lote para os irmãos.

**Tarefas:**

- Criar tabela:
  ```
  charges (id, org_id, member_id, charge_type_id, competence_date, due_date, description,
           amount_cents, status, created_by, created_at, updated_at)
  ```
- Criar cobrança individual (um irmão, um tipo, uma competência)
- Criar cobrança em lote (todos os irmãos ativos, ou seleção manual, com um tipo e competência)
- Campos obrigatórios: `member_id`, `charge_type_id`, `competence_date`, `due_date`, `amount`
- Listagem de cobranças com filtros por: irmão, tipo, status, período de competência, período de vencimento
- Edição permitida somente enquanto status for `pendente`
- Cancelamento via campo `status = cancelada` — nunca exclusão física
- Auditoria: registrar criação, edição e cancelamento
- Índices recomendados: `(org_id, member_id)`, `(org_id, competence_date)`, `(org_id, due_date)`, `(org_id, status)`

**Status de cobrança:**

| Status              | Descrição                        |
| ------------------- | -------------------------------- |
| `pendente`          | Gerada, sem pagamento            |
| `parcialmente_paga` | Pagamento parcial recebido       |
| `paga`              | Totalmente quitada               |
| `cancelada`         | Cancelada — mantida no histórico |
| `estornada`         | Pagamento estornado              |

**Critério de conclusão:** tesoureiro gera cobranças individuais e em lote. Listagem filtra corretamente. Cancelamento preserva histórico.

---

### Parte 1.6 — Pagamentos e baixa

**Objetivo:** registrar pagamentos recebidos e alocar contra cobranças, mantendo saldo correto.

**Tarefas:**

- Criar tabelas:

  ```
  payments (id, org_id, member_id, payment_date, amount_cents, payment_method, notes,
            created_by, created_at, updated_at)

  payment_allocations (id, org_id, payment_id, charge_id, allocated_amount_cents, reversed_at, reversed_by, reversal_reason)
  ```

- Registrar pagamento: data, valor, forma, observação, comprovante (opcional via `attachments`)
- Criar tabela de anexos:
  ```
  attachments (id, org_id, owner_type, owner_id, file_url, file_name, uploaded_by, created_at)
  ```
- Alocação automática FIFO: ao registrar pagamento, quitar cobranças a partir da mais antiga
- Alocação manual: selecionar cobranças específicas e valor para cada
- Suporte a pagamento parcial (cobrança muda para `parcialmente_paga`)
- Suporte a pagamento distribuído entre várias cobranças
- Suporte a pagamento excedente: se o valor pago superar as cobranças, registrar `credit_balance` no membro
  - Adicionar campo `credit_balance_cents BIGINT DEFAULT 0` na tabela `members`
- Estorno: reverter alocação sem exclusão física e recalcular status da cobrança com base no saldo alocado restante
- Auditoria: registrar pagamento, alocação e estorno

**Regras de negócio críticas:**

- Um pagamento pode quitar total ou parcialmente N cobranças
- Uma cobrança pode receber pagamentos parciais de M pagamentos
- `payment_allocations` é o vínculo muitos-para-muitos com rastreabilidade
- Nunca excluir `payment_allocations` — apenas marcar reversão (`reversed_at`/`reversal_reason`)
- O saldo do irmão = `credit_balance_cents` (créditos não alocados)
- Status da cobrança deve ser derivado do total alocado ativo: `pendente`, `parcialmente_paga` ou `paga`

**Critério de conclusão:** tesoureiro registra pagamento, FIFO aloca automaticamente, saldo credor é calculado, estorno reverte sem apagar histórico.

---

## Fase 2 — Portal e recorrência

> Entrega valor direto ao irmão. Pode iniciar quando a Fase 1 estiver concluída.

---

### Parte 2.1 — Extrato individual

**Objetivo:** exibir o histórico financeiro consolidado de cada irmão para o tesoureiro.

**Tarefas:**

- Construir query de extrato: saldo anterior + débitos + créditos = saldo atual
- Tela de extrato acessível pelo tesoureiro (para qualquer irmão)
- Filtro por período (competência ou data de pagamento)
- Listagem cronológica com: data, descrição, tipo, valor, status
- Indicação visual de cobrança vencida
- Resumo no topo: total devido, total pago, saldo credor, cobranças pendentes
- Visão de ficha tradicional: layout derivado em tabela, semelhante à ficha física, gerado a partir dos dados estruturados

**Critério de conclusão:** tesoureiro acessa extrato de qualquer irmão. Filtro de período funciona. Valores batem com os lançamentos registrados.

---

### Parte 2.2 — Geração de PDF

**Objetivo:** exportar extrato e ficha visual em PDF para envio ou impressão.

**Decisão obrigatória antes de iniciar:** definir a stack de geração de PDF.

| Opção                             | Prós                                                           | Contras                                             |
| --------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| React-PDF (`@react-pdf/renderer`) | Integrado ao Next.js, sem dependência externa, fácil de manter | Menos fiel ao HTML, curva de estilo própria         |
| Puppeteer                         | Fidelidade total ao HTML/CSS, qualquer layout                  | Dependência pesada, precisa de Chromium no servidor |

**Recomendação:** usar React-PDF para o MVP pelo menor custo operacional.

**Tarefas:**

- Instalar e configurar a stack escolhida
- Criar serviço backend dedicado na estrutura de feature: `src/features/reports/server/pdf.service.ts`
- Template 1 — Extrato individual: cabeçalho com dados do irmão, tabela de lançamentos, rodapé com saldo
- Template 2 — Ficha visual: layout semelhante à ficha física tradicional, gerada como visão derivada
- Endpoint de download via App Router Route Handler: `src/app/api/members/[id]/extrato/route.ts` (retornando `application/pdf`)
- Endpoint autenticado e com verificação de permissão
- Auditoria: registrar geração de PDF

**Critério de conclusão:** tesoureiro consegue baixar PDF de extrato e ficha. Irmão consegue baixar seu próprio extrato pelo portal (após Parte 2.3).

---

### Parte 2.3 — Portal do irmão

**Objetivo:** disponibilizar painel individual para o irmão consultar sua situação financeira.

**Tarefas:**

- Rota protegida por papel canônico `org:member` e permissão `portal.self.read`
- Isolamento total: queries sempre filtradas por `member_id` do usuário autenticado
- Painel inicial (home):
  - Saldo atual (crédito disponível)
  - Cobranças pendentes (lista resumida com valor e vencimento)
  - Alerta visual para cobranças vencidas
- Página de lançamentos:
  - Histórico cronológico completo
  - Filtro por período
- Página de pagamentos realizados:
  - Lista de pagamentos com data, valor e forma
- Download de extrato em PDF (chamar endpoint da Parte 2.2)
- Dados do cadastro: exibir nome, e-mail, telefone — **nunca** `notes_internal`
- Ocultar completamente: dados de outros irmãos, relatórios, valores internos

**Critério de conclusão:** irmão autenticado vê apenas seus dados. Tentativa de acessar dados de outro irmão retorna 403. PDF de extrato baixa corretamente.

---

### Parte 2.4 — Cobranças recorrentes

**Objetivo:** automatizar a geração mensal de cobranças para tipos recorrentes.

**Decisão obrigatória antes de iniciar:** definir o mecanismo de disparo.

| Opção                                                   | Prós                                         | Contras                                     |
| ------------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Manual pelo tesoureiro (botão "Gerar cobranças do mês") | Simples, sem infra extra, controle explícito | Depende do tesoureiro lembrar               |
| Cron automático (ex: Vercel Cron ou node-cron)          | Autônomo, sem intervenção humana             | Requer infra adicional, risco de duplicatas |

**Recomendação para o MVP:** botão manual pelo tesoureiro com proteção anti-duplicata por competência.

**Tarefas:**

- Criar tabela:
  ```
  recurring_charge_rules (id, org_id, charge_type_id, frequency, amount_cents, active, params_json,
                          created_at, updated_at)
  ```
- CRUD de regras recorrentes (admin e tesoureiro)
- `frequency`: `monthly` para o MVP
- `params_json`: campo livre para configurações futuras (ex: dia de vencimento, escopo de membros)
- Tela de geração: tesoureiro seleciona competência (mês/ano) e lista as regras ativas
- Ao confirmar: sistema gera cobranças em lote para todos os irmãos ativos
- Proteção anti-duplicata: verificar se já existe cobrança com mesmo `member_id + charge_type_id + competence_date`
- Proteção anti-duplicata em banco (obrigatória): `UNIQUE(org_id, member_id, charge_type_id, competence_date)`
- Log de geração: registrar quantas cobranças foram criadas, para qual competência e por quem

**Critério de conclusão:** tesoureiro gera cobranças de um mês com um clique. Segunda tentativa para a mesma competência bloqueia duplicatas. Histórico mostra quem gerou e quando.

---

## Fase 3 — Financeiro gerencial

> Visão consolidada para diretoria e auditoria reforçada.
> Iniciar somente após validação da Parte 2.4 em produção.

---

### Parte 3.1 — Caixa geral da loja

**Objetivo:** registrar entradas e saídas não vinculadas diretamente a cobranças de irmãos.

**Tarefas:**

- Criar tabela:
  ```
  cash_transactions (id, org_id, type, category, description, amount_cents, transaction_date,
                     related_member_id, related_payment_id, created_by, created_at, updated_at)
  ```
- `type`: `entrada` ou `saida`
- Categorias exemplos: aluguel, materiais, eventos, doações, taxas externas
- Tela de lançamento: data, tipo, categoria, descrição, valor
- Tela de consulta: filtro por período, tipo e categoria
- Visão de caixa consolidado: entradas − saídas = saldo do período
- Os pagamentos de irmãos (tabela `payments`) também compõem o caixa via `related_payment_id`

**Critério de conclusão:** tesoureiro registra despesas e receitas avulsas. Caixa consolidado exibe saldo correto do período.

---

### Parte 3.2 — Relatórios financeiros

**Objetivo:** disponibilizar relatórios por período para diretoria e tesouraria.

**Tarefas:**

- Módulo de relatórios acessível por papéis `tesoureiro`, `diretoria` e `admin`
- Módulo de relatórios acessível por papéis canônicos `org:treasurer`, `org:manager` e `org:admin`
- Relatório de entradas por período: por tipo de cobrança, por data
- Relatório de saídas por período: por categoria
- Saldo consolidado: entradas − saídas no período
- Recebimentos por tipo de cobrança: quanto foi recebido de mensalidades, taxas GOB, etc.
- Posição financeira individual: saldo de cada irmão (devido x pago)
- Exportação: cada relatório deve ter botão de download em PDF ou CSV
- Todos os relatórios filtráveis por período (data inicial e final)

**Critério de conclusão:** diretoria acessa relatórios sem conseguir criar ou editar lançamentos. Exportação funciona em PDF e CSV.

---

### Parte 3.3 — Relatório de inadimplência

**Objetivo:** identificar irmãos com cobranças vencidas para acompanhamento da tesouraria.

**Tarefas:**

- Listar irmãos com cobranças no status `pendente` e `due_date < hoje`
- Exibir por irmão: nome, quantidade de cobranças vencidas, valor total em aberto, cobrança mais antiga
- Filtro por tipo de cobrança e período de vencimento
- Indicador de quantos dias em atraso por cobrança
- Exportação do relatório para PDF e CSV
- Acessível para `tesoureiro`, `diretoria` e `admin`
- Acessível para `org:treasurer`, `org:manager` e `org:admin`

**Critério de conclusão:** relatório lista corretamente inadimplentes. Filtros funcionam. Exportação disponível.

---

### Parte 3.4 — Auditoria reforçada

**Objetivo:** garantir rastreabilidade completa de todas as operações críticas.

**Tarefas:**

- Criar (ou completar) tabela:
  ```
  audit_logs (id, org_id, actor_user_id, action, entity_type, entity_id,
              old_data_json, new_data_json, created_at)
  ```
- Confirmar que `updated_at` existe em todas as tabelas: `members`, `charges`, `payments`, `charge_types`, `recurring_charge_rules`, `cash_transactions`
- Garantir registro de auditoria nos seguintes eventos:

| Evento                         | `action`                  | `entity_type`        |
| ------------------------------ | ------------------------- | -------------------- |
| Criação de cobrança            | `charge.created`          | `charge`             |
| Edição de cobrança             | `charge.updated`          | `charge`             |
| Cancelamento de cobrança       | `charge.cancelled`        | `charge`             |
| Registro de pagamento          | `payment.created`         | `payment`            |
| Alocação de pagamento          | `payment.allocated`       | `payment_allocation` |
| Estorno                        | `payment.reversed`        | `payment`            |
| Alteração de permissão         | `role.permission_changed` | `role`               |
| Geração de fechamento (Fase 4) | `period.closed`           | `period`             |

- Tela de visualização de logs: filtro por usuário, tipo de evento e período
- Logs são somente leitura — nenhum papel pode excluir entradas de auditoria

**Critério de conclusão:** toda ação crítica gera registro. `old_data_json` e `new_data_json` preservam o estado antes e depois. Tela de logs exibe histórico filtrado.

---

## Fase 4 — Automação e fechamento

> Conforto operacional e preparação para crescimento. Iniciar após Fase 3 em produção.

---

### Parte 4.1 — Notificações por e-mail

**Objetivo:** comunicar automaticamente irmãos sobre situação financeira.

> **Nota:** esta parte pode ser antecipada para o final da Fase 2 com baixo custo adicional, já que o portal do irmão estará ativo nesse momento.

**Tarefas:**

- Configurar serviço de envio de e-mail (Resend, SendGrid ou SMTP próprio)
- Criar sistema de templates de e-mail (HTML responsivo)
- Notificações a implementar:
  - Cobrança próxima do vencimento (ex: 3 dias antes)
  - Cobrança vencida (disparada no dia do vencimento)
  - Lembrete de inadimplência (ex: 15 dias após vencimento)
  - Confirmação de pagamento recebido (após registro pelo tesoureiro)
- Configuração por loja: quais notificações estão ativas e com quantos dias de antecedência
- Fila de envio: usar processamento assíncrono para não bloquear a requisição
- Log de envios: registrar e-mails enviados com status (sucesso/falha)

**Critério de conclusão:** irmão recebe e-mail ao ter cobrança gerada e ao ter pagamento registrado. Tesoureiro consegue ver log de notificações enviadas.

---

### Parte 4.2 — Fechamento mensal

**Objetivo:** formalizar o encerramento de competências e impedir alterações retroativas sem rastreabilidade.

**Tarefas:**

- Criar tabela:
  ```
  period_closings (id, org_id, competence_month, competence_year, closed_by, closed_at,
                   total_charged_cents, total_received_cents, balance_cents, notes)
  ```
- Tela de fechamento: tesoureiro seleciona competência e confirma fechamento
- Ao fechar: registrar snapshot financeiro do período (totais) em `period_closings`
- Após fechamento: bloquear edição direta de cobranças da competência encerrada
- Ajuste formal: criar mecanismo de "ajuste de período fechado" com justificativa obrigatória e auditoria
- Relatório de fechamento exportável em PDF
- Acessível apenas para `tesoureiro` e `admin`
- Acessível apenas para `org:treasurer` e `org:admin`

**Critério de conclusão:** competência fechada não permite edição direta. Ajuste formal gera auditoria com justificativa. PDF de fechamento exportável.

---

### Parte 4.3 — Dashboard executivo

**Objetivo:** painel visual com indicadores-chave para o tesoureiro e a diretoria.

**Tarefas:**

- Painel administrativo (home do tesoureiro):
  - Total recebido no mês corrente
  - Total pendente (todas as cobranças em aberto)
  - Número de inadimplentes
  - Gráfico de entradas vs saídas nos últimos 6 meses
  - Lançamentos recentes (últimos 10)
  - Atalhos rápidos: "Gerar cobranças", "Registrar pagamento", "Ver inadimplentes"
- Painel da diretoria:
  - Indicadores de adimplência (% de irmãos em dia)
  - Saldo de caixa atual
  - Comparativo mês atual vs mês anterior
- Filtro de período nos gráficos

**Critério de conclusão:** painel carrega em menos de 2 segundos. Indicadores refletem dados reais. Atalhos funcionam.

---

### Parte 4.4 — Integrações futuras

**Objetivo:** preparar a base para integrações externas sem comprometer a arquitetura atual.

**Tarefas:**

- Documentar e expor API REST interna com autenticação por token
- Estrutura de webhooks: ao registrar pagamento, disparar evento para sistemas externos (futuro)
- Preparar endpoint de conciliação bancária: receber extrato bancário e comparar com `cash_transactions`
- Multi-loja nativo via **Clerk Organizations**: a arquitetura da base atual do _Dashboard Starter_ é construída ao redor do Clerk Organizations, que provê isolamento Multi-Tenant imediatamente.
  - O `org_id` já deve estar presente desde a Fase 1 em todas as entidades de negócio.
  - Toda query Prisma deve incluir restrição de tenant usando `org_id` recuperado do contexto autenticado da API.

**Critério de conclusão:** API documentada (Swagger ou similar). Multi-tenant validado com `org_id` em rotas, consultas e integrações.

---

### Parte 4.5 — Estorno de pagamentos (pendência futura)

**Objetivo:** implementar estorno completo com rastreabilidade contábil, sem exclusão física de dados.

**Escopo mínimo:**

- Adicionar ação/botão `Estornar` na listagem de pagamentos e na tela de recibo
- Criar fluxo de confirmação com justificativa obrigatória (`reversal_reason`)
- Implementar ação server-side transacional para reversão lógica de alocações
- Adicionar campos de reversão em `payment_allocations`:
  - `reversed_at`
  - `reversed_by`
  - `reversal_reason`
- Recalcular status da cobrança com base no total alocado ativo:
  - `pendente`, `parcialmente_paga`, `paga`
- Recalcular saldo credor do membro (`credit_balance_cents`) quando aplicável
- Registrar auditoria com evento `payment.reversed`
- Revalidar telas de pagamentos, cobranças, extrato e portal do irmão

**Critério de conclusão:**

- Estorno total/parcial funcionando pela interface
- Nenhuma deleção física em `payment_allocations`
- Auditoria completa com antes/depois
- Dados refletidos corretamente em relatórios e extratos

---

## Dependências entre partes

```
1.1 Infraestrutura
  └── 1.2 Auth e permissões
        ├── 1.3 Membros
        │     └── 1.5 Cobranças manuais
        │           └── 1.6 Pagamentos e baixa
        │                 ├── 2.1 Extrato individual
        │                 │     └── 2.2 Geração de PDF
        │                 │           └── 2.3 Portal do irmão
        │                 └── 2.4 Cobranças recorrentes
        │                       ├── 3.1 Caixa geral
        │                       ├── 3.2 Relatórios financeiros
        │                       ├── 3.3 Inadimplência
        │                       └── 3.4 Auditoria reforçada
        │                             ├── 4.1 Notificações
        │                             ├── 4.2 Fechamento mensal
        │                             ├── 4.3 Dashboard executivo
        │                             └── 4.4 Integrações futuras
        └── 1.4 Tipos de cobrança
              └── (alimenta 1.5)
```

---

## Decisões técnicas obrigatórias

Estas decisões devem ser tomadas **antes** de iniciar a parte correspondente. Deixar para depois gera retrabalho.

| Decisão                                   | Antes de iniciar | Opções                                                                           | Recomendação                                                                                    |
| ----------------------------------------- | ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Estratégia de Sessão e Controle de Acesso | Parte 1.2        | Custom DB Auth vs Clerk Auth                                                     | Integrar ao **Clerk** — Já vem plugado no boilerplate poupando amplo tempo de construção seguro |
| Estratégia monetária                      | Parte 1.1        | `DECIMAL` vs valores em centavos (`BIGINT`)                                      | Valores em centavos (`BIGINT`) no MVP — elimina erro de arredondamento                          |
| Saldo credor: campo vs entrada em tabela  | Parte 1.6        | `credit_balance_cents` em `members` ou entrada especial em `payment_allocations` | Campo `credit_balance_cents` em `members` — queries mais simples                                |
| Stack de geração de PDF                   | Parte 2.2        | React-PDF ou Puppeteer                                                           | React-PDF para o MVP                                                                            |
| Disparo de recorrência: manual vs cron    | Parte 2.4        | Botão manual ou job automático                                                   | Botão manual com proteção anti-duplicata                                                        |
| Serviço de e-mail                         | Parte 4.1        | Resend, SendGrid, SMTP próprio                                                   | Resend — API simples, plano gratuito generoso                                                   |
| Estratégia de Cadastro                    | Parte 1.2        | Público vs Whitelist via Banco                                                   | **Whitelist** — Apenas quem já está no banco de Membros pode criar conta                        |
| Chave de Vínculo                          | Parte 1.3        | Apenas Email vs Email + CIM                                                      | **Email + CIM** — Garante que o vínculo automático não ocorra por erro de digitação             |

---

_Documento gerado com base no PRD da Loja Maçônica — revisão incorporando sugestões de arquitetura._
_Última atualização: 2026-03-27_
