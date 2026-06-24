# Research: Auditoria Reforcada (Parte 3.4)

## Decision 1: Incluir `org_id` na trilha de auditoria

- **Decision**: Evoluir o registro de auditoria para conter `org_id` obrigatorio em novos eventos.
- **Rationale**: O requisito de isolamento por organizacao depende de chave explicita de tenant no proprio log, evitando inferencia por joins em entidades heterogeneas.
- **Alternatives considered**:
  - Inferir organizacao pelo `entity_id` em cada consulta: rejeitado por custo e risco de inconsistencia.
  - Isolamento apenas por role/session sem `org_id` no log: rejeitado por fragilidade para auditoria historica.

## Decision 2: Escrita de auditoria no mesmo fluxo transacional da operacao critica

- **Decision**: Gravar `audit_logs` no mesmo contexto transacional da operacao que dispara o evento (quando houver transacao) ou no mesmo fluxo atomicamente encadeado.
- **Rationale**: O criterio de confiabilidade exige que acao critica bem-sucedida sempre tenha log correspondente.
- **Alternatives considered**:
  - Fila assíncrona de auditoria: rejeitado para este item por risco de perda/atraso de registro.
  - Batch de reconciliacao posterior: rejeitado por nao garantir rastreabilidade imediata.

## Decision 3: Catalogo padronizado de eventos auditaveis

- **Decision**: Adotar catalogo fechado para `action` e `entity_type` nos eventos obrigatorios: `charge.*`, `payment.*`, `role.permission_changed`, `period.closed`.
- **Rationale**: Sem padronizacao, filtros por evento ficam inconsistentes e dificultam investigacao operacional.
- **Alternatives considered**:
  - Strings livres por modulo: rejeitado por causar divergencia semantica e ruido na consulta.
  - Mapeamento apenas em documentacao: rejeitado por nao prevenir desvio em runtime.

## Decision 4: Contratos de leitura para auditoria (lista + detalhe)

- **Decision**: Definir contrato de interface para consulta de logs paginados e detalhe por ID com payload old/new.
- **Rationale**: A tela de auditoria depende de campos e filtros estaveis; contrato explicito reduz regressao entre backend e UI.
- **Alternatives considered**:
  - Consultar diretamente sem contrato formal: rejeitado por risco de acoplamento fragil entre camadas.
  - Endpoint unico sem detalhe dedicado: rejeitado por sobrecarga de lista e pior UX para inspecao.

## Decision 5: Somente leitura como regra de produto

- **Decision**: Nao expor comandos de edicao/exclusao para logs em UI nem em rotas relacionadas.
- **Rationale**: Integridade da auditoria depende de imutabilidade operacional.
- **Alternatives considered**:
  - Soft delete para "higiene": rejeitado por romper trilha historica.
  - Edicao com perfil admin: rejeitado por conflito com objetivo de confiabilidade.

## Decision 6: Filtros e paginacao com comportamento previsivel

- **Decision**: Aplicar filtros por usuario, acao e periodo com paginação deterministica e ordenacao descendente por data.
- **Rationale**: Equipe de tesouraria precisa localizar eventos rapidamente em volume alto.
- **Alternatives considered**:
  - Scroll infinito sem pagina numerada: rejeitado por baixa previsibilidade em auditoria investigativa.
  - Ordenacao ascendente padrao: rejeitado por priorizar eventos antigos em vez dos mais recentes.
