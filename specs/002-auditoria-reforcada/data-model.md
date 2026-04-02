# Data Model: Auditoria Reforcada (Parte 3.4)

## Entity: AuditLog

- **Purpose**: Registro imutavel de uma acao critica auditavel.

### Fields

- `id` (string, required): identificador unico do log.
- `org_id` (string, required): identificador da organizacao dona do evento.
- `actor_user_id` (string, optional): identificador do ator autenticado que acionou o evento.
- `action` (string, required): codigo padronizado do evento (`charge.created`, `payment.reversed`, etc.).
- `entity_type` (string, required): tipo da entidade alvo (`charge`, `payment`, `payment_allocation`, `role`, `period`, etc.).
- `entity_id` (string, required): identificador da entidade alvo.
- `old_data_json` (json, optional): snapshot antes da alteracao.
- `new_data_json` (json, optional): snapshot apos alteracao ou contexto minimo do evento.
- `created_at` (datetime, required): data/hora do registro.

### Validation Rules

- `action` deve pertencer ao catalogo de eventos suportados.
- `entity_type` deve ser coerente com `action`.
- Em eventos de criacao: `new_data_json` obrigatorio.
- Em eventos de atualizacao/cancelamento/estorno: `old_data_json` e `new_data_json` obrigatorios.
- `org_id` obrigatorio para isolamento multi-tenant.

### Indexing Guidance

- Indice composto em (`org_id`, `created_at`) para listagem padrao.
- Indice composto em (`org_id`, `action`, `created_at`) para filtro por tipo de evento.
- Indice em (`org_id`, `actor_user_id`, `created_at`) para filtro por usuario.

## Entity: AuditLogFilter

- **Purpose**: Parametros de consulta para listar logs com recorte operacional.

### Fields

- `actor_user_id` (string, optional)
- `action` (string, optional)
- `date_from` (date, optional)
- `date_to` (date, optional)
- `page` (number, required)
- `page_size` (number, required)

### Validation Rules

- `date_from` <= `date_to`.
- `page` >= 1.
- `page_size` dentro do limite operacional definido pelo produto.

## Entity: AuditLogListItem

- **Purpose**: Projecao de leitura para tabela principal de auditoria.

### Fields

- `id`
- `created_at`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`

## Entity: AuditLogDetail

- **Purpose**: Projecao de leitura para inspecao detalhada do registro.

### Fields

- Todos os campos de `AuditLogListItem`
- `old_data_json`
- `new_data_json`

## Relationship Summary

- `AuditLog` referencia contexto organizacional por `org_id`.
- `AuditLog` referencia ator por `actor_user_id` (quando disponivel).
- `AuditLog` referencia entidade de negocio por (`entity_type`, `entity_id`).

## State and Transition Notes

- `AuditLog` e append-only: estado permitido = "criado".
- Nao existe transicao de update/delete para `AuditLog`.
- Eventos de dominio produzem novos `AuditLog` sem mutar registros anteriores.
