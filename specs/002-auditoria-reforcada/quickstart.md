# Quickstart: Auditoria Reforcada (Parte 3.4)

## Objetivo

Validar rapidamente a entrega do item 3.4 cobrindo: eventos auditaveis, consulta filtrada, RBAC e imutabilidade.

## Pre-condicoes

- Ambiente com banco atualizado e dados de teste.
- Usuarios de teste com papeis: `org:admin`, `org:treasurer`, `org:manager`, `org:member`.
- Organizacao ativa selecionada no Clerk.

## Fluxo de Validacao

1. Execute uma acao `charge.created`.
2. Execute uma acao `charge.updated`.
3. Execute uma acao `charge.cancelled`.
4. Execute uma acao `payment.created` com alocacao.
5. Execute uma acao `payment.reversed`.
6. (Se disponivel no ambiente) execute `role.permission_changed` e `period.closed`.

## Verificacoes Esperadas

- Cada acao acima gera exatamente 1 log com `action` correta.
- Eventos de criacao contem `new_data_json` preenchido.
- Eventos de alteracao/estorno contem `old_data_json` e `new_data_json`.
- Lista de auditoria exibe: data/hora, ator, acao, entidade e identificador.
- Filtros por usuario, acao e periodo funcionam isolados e combinados.
- Detalhe do log exibe payload old/new.
- Consulta mostra apenas logs da organizacao ativa.
- Usuario `org:member` recebe bloqueio explicito ao acessar auditoria.
- Nao existe fluxo de editar/excluir log.

## Verificacao Tecnica Rapida

- Executar verificacao de tipos:
  - `npx tsc --noEmit`
- Executar lint quando versao de Node do ambiente for compativel:
  - `npm run lint`

## Criterio de Pronto

Entrega aprovada quando os criterios CA-001..CA-010 da spec forem atendidos sem excecoes.
