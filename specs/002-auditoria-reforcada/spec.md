# Feature Specification: Auditoria Reforcada (Parte 3.4)

**Feature Branch**: `[002-auditoria-reforcada]`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Implementar apenas a Parte 3.4 - Auditoria reforcada, com trilha completa de eventos criticos, consulta filtravel e RBAC"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Registrar trilha confiavel de eventos criticos (Priority: P1)

Como tesoureiro(a)/gestor(a), quero que toda acao critica financeira gere auditoria padronizada para garantir rastreabilidade e responsabilizacao.

**Why this priority**: Sem registro confiavel dos eventos criticos, a governanca financeira fica comprometida.

**Independent Test**: Executar criacao, edicao, cancelamento, pagamento, alocacao e estorno e validar que cada acao gera um log com campos obrigatorios e snapshots corretos.

**Acceptance Scenarios**:

1. **Given** uma criacao de cobranca concluida, **When** a operacao termina com sucesso, **Then** e gravado um log `charge.created` com `new_data_json` preenchido.
2. **Given** uma edicao de cobranca concluida, **When** a operacao termina com sucesso, **Then** e gravado um log `charge.updated` com `old_data_json` e `new_data_json` preenchidos.
3. **Given** um estorno de pagamento concluido, **When** a operacao termina com sucesso, **Then** e gravado um log `payment.reversed` com snapshots antes/depois quando aplicavel.

---

### User Story 2 - Consultar historico de auditoria por filtros (Priority: P2)

Como diretoria/tesouraria, quero consultar os logs por usuario, evento e periodo para investigar ocorrencias e acompanhar operacoes.

**Why this priority**: O valor de auditoria depende de conseguir localizar eventos rapidamente.

**Independent Test**: Acessar a tela de logs, aplicar filtros isolados e combinados e validar que a lista retorna somente eventos do recorte informado.

**Acceptance Scenarios**:

1. **Given** logs de multiplos usuarios e eventos, **When** o usuario filtra por `actor_user_id`, **Then** a lista mostra apenas registros daquele ator.
2. **Given** logs em periodos diferentes, **When** o usuario filtra por intervalo de datas, **Then** a lista mostra apenas registros no periodo informado.
3. **Given** um registro listado, **When** o usuario abre o detalhe, **Then** consegue inspecionar `old_data_json` e `new_data_json` daquele evento.

---

### User Story 3 - Proteger acesso e integridade dos logs (Priority: P3)

Como administrador da organizacao, quero restringir a visualizacao da auditoria a papeis permitidos e impedir alteracao/exclusao de logs.

**Why this priority**: Auditoria so e confiavel se estiver protegida contra acesso indevido e adulteracao.

**Independent Test**: Tentar acesso com `org:member`, tentar alteracao/exclusao de log e validar bloqueios; validar acesso normal para `org:treasurer`, `org:manager`, `org:admin`.

**Acceptance Scenarios**:

1. **Given** usuario `org:member`, **When** tenta acessar a tela ou rota da auditoria, **Then** recebe bloqueio explicito de acesso.
2. **Given** um usuario autorizado, **When** tenta editar ou excluir um log, **Then** a operacao e negada.
3. **Given** usuario autorizado, **When** consulta auditoria da organizacao ativa, **Then** nao visualiza registros de outras organizacoes.

---

### Edge Cases

- Evento critico concluido parcialmente e depois revertido no mesmo fluxo.
- Evento critico sem entidade persistida final (falha antes de concluir).
- Filtro com data inicial maior que data final.
- Filtros sem resultados no periodo selecionado.
- `period.closed` ainda nao disponivel no produto no momento da entrega do item 3.4.
- Usuario de papel permitido sem vinculo de ator interno completo.

## Requirements _(mandatory)_

### Objetivo do Item 3.4 (Escopo e Fora de Escopo)

- **Escopo**: padronizar auditoria de eventos criticos financeiros, garantir imutabilidade dos logs, disponibilizar consulta filtravel e reforcar RBAC e isolamento por organizacao.
- **Fora de escopo**: notificacoes por e-mail, fechamento mensal completo da fase 4, mudanca de regras financeiras de cobranca/pagamento e qualquer funcionalidade fora da Parte 3.4.

### Functional Requirements

- **FR-001**: O sistema DEVE possuir estrutura de auditoria com os campos `id`, `org_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `old_data_json`, `new_data_json` e `created_at`.
- **FR-002**: O sistema DEVE garantir que as tabelas `members`, `charges`, `payments`, `charge_types`, `recurring_charge_rules` e `cash_transactions` mantenham campo de atualizacao para rastreabilidade temporal.
- **FR-003**: O sistema DEVE registrar auditoria para `charge.created`, `charge.updated` e `charge.cancelled`.
- **FR-004**: O sistema DEVE registrar auditoria para `payment.created`, `payment.allocated` e `payment.reversed`.
- **FR-005**: O sistema DEVE registrar auditoria para `role.permission_changed`.
- **FR-006**: O sistema DEVE registrar auditoria para `period.closed` quando este evento estiver disponivel no fluxo de fechamento.
- **FR-007**: Para eventos de criacao, o sistema DEVE preencher `new_data_json` com o estado criado.
- **FR-008**: Para eventos de atualizacao/cancelamento/estorno, o sistema DEVE preencher `old_data_json` e `new_data_json` com estado anterior e posterior.
- **FR-009**: Para eventos sem alteracao de entidade, o sistema DEVE registrar contexto minimo no `new_data_json`.
- **FR-010**: O sistema DEVE disponibilizar tela de auditoria com filtros por usuario, tipo de evento (`action`) e periodo.
- **FR-011**: O sistema DEVE exibir em lista, no minimo: data/hora, ator, acao, entidade e identificador da entidade.
- **FR-012**: O sistema DEVE permitir inspecao de `old_data_json` e `new_data_json` por registro.
- **FR-013**: O sistema DEVE manter logs como somente leitura, sem operacoes de edicao ou exclusao.
- **FR-014**: O sistema DEVE paginar a listagem de logs para manter navegacao e leitura eficientes.
- **FR-015**: O sistema DEVE restringir acesso da auditoria para `org:treasurer`, `org:manager` e `org:admin`.
- **FR-016**: O sistema DEVE bloquear `org:member` em tela e acessos diretos relacionados ao modulo de auditoria com resposta explicita.
- **FR-017**: O sistema DEVE isolar logs por `org_id`, exibindo apenas dados da organizacao ativa.

### Requisitos Nao Funcionais

- **RNF-001 (Seguranca)**: Nenhum usuario nao autorizado pode visualizar, editar ou excluir logs de auditoria.
- **RNF-002 (Seguranca)**: O modulo deve garantir isolamento total por organizacao em consultas e detalhes.
- **RNF-003 (Performance)**: Consultas filtradas e paginadas devem retornar em tempo util para operacao diaria, mesmo com alto volume historico.
- **RNF-004 (Confiabilidade)**: Em operacao critica bem-sucedida, o registro de auditoria correspondente deve existir obrigatoriamente.
- **RNF-005 (UX)**: Tela de auditoria deve apresentar estados claros de carregamento, vazio e erro com mensagens objetivas em PT-BR.

### Regras de Negocio e Validacoes

- **RB-001**: Cada evento critico mapeado gera exatamente um registro de auditoria por execucao bem-sucedida.
- **RB-002**: `action` deve seguir nomenclatura padronizada, sem variacoes livres por fluxo.
- **RB-003**: `entity_type` e `entity_id` devem ser preenchidos de forma consistente para correlacao de historico.
- **RB-004**: Filtros de periodo usam limites inclusivos de inicio e fim.
- **RB-005**: Se o periodo informado for invalido, a consulta deve ser bloqueada com orientacao de correcao.
- **RB-006**: Ausencia de evento aplicavel (ex.: `period.closed` antes da Fase 4) nao invalida os demais registros obrigatorios do item 3.4.

### Casos de Erro e Estados Vazios

- **ER-001**: Falha ao registrar log em acao critica deve ser tratada como incidente de confiabilidade e reportada ao operador.
- **ER-002**: Falha na consulta de auditoria deve exibir mensagem clara e opcao de tentar novamente.
- **ER-003**: Acesso nao autorizado deve retornar bloqueio explicito.
- **EV-001**: Filtro sem resultados deve mostrar estado vazio com orientacao para ajustar filtros.

### Permissoes / RBAC

- **Acesso permitido**: `org:treasurer`, `org:manager`, `org:admin`.
- **Acesso bloqueado**: `org:member`.
- **Escopo de acesso**: leitura de logs apenas da organizacao ativa.
- **Integridade**: nenhum papel pode editar ou excluir entradas de auditoria.

### Criterios de Aceite Testaveis (Given/When/Then)

- **CA-001**: **Given** criacao de cobranca bem-sucedida, **When** a auditoria e consultada, **Then** existe registro `charge.created` com `new_data_json` preenchido.
- **CA-002**: **Given** atualizacao de cobranca bem-sucedida, **When** a auditoria e consultada, **Then** existe registro `charge.updated` com `old_data_json` e `new_data_json` preenchidos.
- **CA-003**: **Given** registro de pagamento e alocacao bem-sucedidos, **When** a auditoria e consultada, **Then** existem eventos `payment.created` e `payment.allocated` com `entity_type` esperado.
- **CA-004**: **Given** estorno de pagamento bem-sucedido, **When** a auditoria e consultada, **Then** existe evento `payment.reversed` com trilha de alteracao aplicavel.
- **CA-005**: **Given** logs de periodos distintos, **When** filtro por periodo e aplicado, **Then** somente logs dentro do intervalo sao exibidos.
- **CA-006**: **Given** logs de varios usuarios, **When** filtro por usuario e aplicado, **Then** somente logs do usuario selecionado sao exibidos.
- **CA-007**: **Given** usuario autorizado na tela de auditoria, **When** abre detalhe de um registro, **Then** visualiza payload de `old_data_json` e `new_data_json`.
- **CA-008**: **Given** usuario `org:member`, **When** tenta acessar modulo de auditoria por navegacao ou URL direta, **Then** recebe bloqueio explicito.
- **CA-009**: **Given** tentativa de editar ou excluir entrada de auditoria, **When** a operacao e acionada, **Then** a alteracao e negada.
- **CA-010**: **Given** organizacoes diferentes com logs proprios, **When** usuario consulta a auditoria da organizacao ativa, **Then** nao ha vazamento de registros de outra organizacao.

### Dependencias e Impactos em Modulos Existentes

- Depende dos modulos de cobrancas, pagamentos, permissoes e fechamento para emissao de eventos auditaveis.
- Impacta os fluxos que hoje ja registram auditoria e exige padronizacao uniforme de `action`, `entity_type` e snapshots.
- Requer pagina de auditoria no dashboard com filtros e visualizacao detalhada de payload.
- Requer alinhamento com contexto tecnico vigente do projeto (App Router, TypeScript strict, Prisma, Clerk org/role, estrutura feature-based e padrao visual atual do dashboard).

### Key Entities _(include if feature involves data)_

- **Audit Log Entry**: registro imutavel de auditoria com identificacao de organizacao, ator, acao, entidade, snapshots e data/hora.
- **Auditable Event**: acao critica do dominio financeiro que dispara criacao de log padronizado.
- **Audit Query Filter**: conjunto de parametros de consulta (usuario, acao, periodo, pagina) para localizar eventos.
- **Audit Snapshot**: representacao do estado anterior/posterior (`old_data_json`, `new_data_json`) associada ao evento.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% dos eventos criticos definidos no escopo possuem registro de auditoria apos execucao bem-sucedida.
- **SC-002**: 100% dos eventos de atualizacao/cancelamento/estorno exibem estado antes/depois quando aplicavel.
- **SC-003**: 100% das tentativas de acesso por `org:member` ao modulo de auditoria sao bloqueadas explicitamente.
- **SC-004**: Em homologacao com alto volume de registros, consultas filtradas e paginadas retornam resultados de forma operacionalmente aceitavel para uso cotidiano.
- **SC-005**: Em validacao com usuarios de tesouraria/diretoria, ao menos 90% conseguem localizar um evento alvo usando filtros sem apoio externo.

## Assumptions

- O sistema ja possui autenticacao organizacional ativa e papeis validos para aplicacao de RBAC.
- Eventos `period.closed` podem nao ocorrer durante a entrega inicial da Parte 3.4, mas o padrao de auditoria deve estar definido para quando o fluxo existir.
- Mensagens e labels da tela de auditoria devem permanecer em PT-BR, seguindo padrao atual do produto.
- Nao ha necessidade de remocao retroativa de logs antigos para concluir este item.
