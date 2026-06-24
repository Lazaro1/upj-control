# Feature Specification: Relatorio de Inadimplencia (Parte 3.3)

**Feature Branch**: `[001-inadimplencia-report]`  
**Created**: 2026-03-30  
**Status**: Draft  
**Input**: User description: "Implementar APENAS a Parte 3.3 - Relatorio de inadimplencia, com filtros, indicadores de atraso, exportacao PDF/CSV e RBAC para tesouraria/diretoria/admin"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visualizar inadimplentes consolidados (Priority: P1)

Como tesoureiro(a), quero ver a lista de irmaos inadimplentes com dados consolidados por pessoa para priorizar cobrancas e acompanhamento financeiro.

**Why this priority**: Este e o objetivo central do item 3.3 e entrega valor imediato para operacao da tesouraria.

**Independent Test**: Pode ser testado criando cobrancas com vencimento passado e status pendente, acessando o relatorio e validando os totais por irmao.

**Acceptance Scenarios**:

1. **Given** que existem cobrancas com status `pendente` e vencimento anterior a hoje, **When** o usuario autorizado abre o relatorio, **Then** o sistema lista apenas os irmaos com inadimplencia ativa.
2. **Given** um irmao com multiplas cobrancas vencidas pendentes, **When** o relatorio e exibido, **Then** o sistema mostra nome, quantidade de cobrancas vencidas, valor total em aberto e data da cobranca mais antiga desse irmao.
3. **Given** cobrancas com vencimento hoje ou futuro, **When** o relatorio e exibido, **Then** essas cobrancas nao entram no calculo de inadimplencia.

---

### User Story 2 - Filtrar e detalhar atraso (Priority: P2)

Como tesoureiro(a), quero filtrar inadimplencia por tipo de cobranca e periodo de vencimento para analisar grupos especificos e agir com mais precisao.

**Why this priority**: Os filtros transformam a visao geral em ferramenta de analise operacional para tomada de decisao.

**Independent Test**: Pode ser testado aplicando filtros em conjunto e verificando se o conjunto retornado respeita os criterios de tipo e periodo.

**Acceptance Scenarios**:

1. **Given** cobrancas vencidas de tipos diferentes, **When** o usuario filtra por um tipo especifico, **Then** o relatorio mostra apenas inadimplencias daquele tipo.
2. **Given** cobrancas vencidas em meses distintos, **When** o usuario define um periodo de vencimento, **Then** o relatorio retorna apenas cobrancas dentro do intervalo informado.
3. **Given** cobrancas vencidas listadas, **When** o relatorio exibe cada cobranca, **Then** o sistema apresenta o indicador de dias em atraso para cada item.

---

### User Story 3 - Exportar relatorio para acompanhamento externo (Priority: P3)

Como usuario autorizado da diretoria/tesouraria, quero exportar o relatorio em PDF e CSV para compartilhar, arquivar e acompanhar cobrancas fora da tela.

**Why this priority**: A exportacao amplia uso do relatorio para reunioes, prestacao de contas e acao operacional fora do sistema.

**Independent Test**: Pode ser testado com filtro aplicado, executando exportacao PDF e CSV e validando consistencia dos dados exportados com a tela.

**Acceptance Scenarios**:

1. **Given** um relatorio com dados e filtros ativos, **When** o usuario exporta em CSV, **Then** o arquivo baixado contem o mesmo recorte exibido na tela.
2. **Given** um relatorio com dados e filtros ativos, **When** o usuario exporta em PDF, **Then** o arquivo baixado contem o mesmo recorte exibido na tela em formato legivel para compartilhamento.
3. **Given** um usuario com papel `org:member`, **When** ele tenta acessar o relatorio, **Then** o sistema bloqueia acesso e nao permite visualizacao nem exportacao.

---

### Edge Cases

- Nao existem cobrancas pendentes vencidas para os filtros informados.
- Existe cobranca com `due_date` exatamente na data atual (nao deve ser considerada vencida).
- Existem cobrancas vencidas com valor zero (devem contar na quantidade, sem inflar valor total).
- Usuario informa intervalo de datas invalido (data inicial maior que data final).
- Dados mudam entre visualizacao e exportacao (exportacao deve refletir o mesmo conjunto filtrado no momento da acao).
- Usuario sem permissao tenta acessar URL direta do relatorio.

## Requirements _(mandatory)_

### Objetivo do Item 3.3 (Escopo e Fora de Escopo)

- **Escopo**: listar inadimplencia por irmao com consolidacao de cobrancas vencidas pendentes, filtros por tipo/periodo, indicador de dias em atraso, exportacao PDF/CSV e controle de acesso por papel organizacional.
- **Fora de escopo**: envio de notificacoes, renegociacao de divida, registro/baixa de pagamento, criacao/edicao/cancelamento de cobrancas e qualquer funcionalidade de outros itens do plano.

### Functional Requirements

- **FR-001**: O sistema DEVE considerar inadimplente apenas cobranca com status `pendente` e `due_date` estritamente menor que a data atual.
- **FR-002**: O sistema DEVE listar no relatorio apenas irmaos que possuam ao menos uma cobranca enquadrada como inadimplente.
- **FR-003**: O sistema DEVE apresentar por irmao: nome, quantidade de cobrancas vencidas, valor total em aberto e data da cobranca mais antiga em aberto.
- **FR-004**: O sistema DEVE permitir filtro por tipo de cobranca.
- **FR-005**: O sistema DEVE permitir filtro por periodo de vencimento (data inicial e data final).
- **FR-006**: O sistema DEVE aplicar o periodo de vencimento com limites inclusivos (data de vencimento >= data inicial e <= data final).
- **FR-007**: O sistema DEVE exibir, para cada cobranca exibida no relatorio, o total de dias em atraso calculado a partir da data de vencimento.
- **FR-008**: O sistema DEVE permitir uso combinado dos filtros por tipo e periodo.
- **FR-009**: O sistema DEVE permitir exportacao do relatorio em formato CSV.
- **FR-010**: O sistema DEVE permitir exportacao do relatorio em formato PDF.
- **FR-011**: O sistema DEVE garantir que os dados exportados respeitem exatamente os filtros aplicados no momento da exportacao.
- **FR-012**: O sistema DEVE incluir nas exportacoes um bloco consolidado por irmao e um bloco detalhado por cobranca.
- **FR-013**: O sistema DEVE disponibilizar acesso ao relatorio apenas para papeis `org:treasurer`, `org:manager` e `org:admin`.
- **FR-014**: O sistema DEVE bloquear acesso ao relatorio para papel `org:member`, inclusive por acesso direto via URL.
- **FR-015**: O sistema DEVE apresentar mensagem de estado vazio quando nao houver inadimplentes para os filtros selecionados.
- **FR-016**: O sistema DEVE validar o periodo informado e impedir consulta quando a data inicial for maior que a data final.
- **FR-017**: O papel `org:manager` DEVE ter permissao apenas de visualizacao e exportacao neste relatorio, sem acoes operacionais adicionais.
- **FR-018**: Em tentativa de acesso por `org:member`, o sistema DEVE responder com bloqueio de acesso (403) e mensagem explicativa.

### Requisitos Nao Funcionais

- **RNF-001 (Seguranca)**: O acesso ao relatorio e as exportacoes devem seguir o mesmo controle RBAC, sem exposicao de dados para papeis nao autorizados.
- **RNF-002 (Performance)**: A consulta inicial e consultas filtradas devem retornar resultado utilizavel em ate 3 segundos para base com ate 10.000 cobrancas vencidas pendentes dentro da organizacao.
- **RNF-003 (Performance)**: A geracao de exportacao CSV e PDF deve concluir em ate 10 segundos para ate 5.000 linhas exportadas.
- **RNF-004 (Auditoria)**: Cada exportacao deve registrar evento de auditoria contendo organizacao, usuario, tipo de arquivo, filtros aplicados e data/hora.
- **RNF-004A (Auditoria)**: O escopo de auditoria deste item cobre apenas eventos de exportacao; visualizacao e alteracao de filtros nao geram log adicional neste item.
- **RNF-005 (UX)**: O relatorio deve informar claramente criterios ativos, totalizadores exibidos e estados de carregamento/erro/vazio com linguagem objetiva.

### Regras de Negocio e Validacoes

- **RB-001**: "Hoje" deve ser interpretado na referencia temporal da organizacao ativa, para evitar classificacao incorreta de atraso.
- **RB-002**: Dias em atraso = diferenca inteira entre data atual e data de vencimento; cobranca vencida no dia anterior resulta em 1 dia.
- **RB-003**: "Cobranca mais antiga" corresponde ao menor `due_date` entre cobrancas vencidas pendentes do mesmo irmao.
- **RB-004**: Valor total em aberto por irmao e a soma dos valores em aberto das cobrancas vencidas pendentes dentro dos filtros aplicados.
- **RB-005**: Filtro de periodo aplica-se ao campo de vencimento da cobranca.
- **RB-006**: Valores monetarios exibidos e exportados devem usar 2 casas decimais com arredondamento half-up.

### Casos de Erro e Estados Vazios

- **ER-001**: Se o periodo for invalido, o sistema deve bloquear a busca e orientar correcao do intervalo.
- **ER-002**: Se ocorrer falha de consulta, o sistema deve exibir mensagem de erro e opcao de tentar novamente, sem perder filtros ja preenchidos.
- **ER-003**: Se ocorrer falha na exportacao, o sistema deve informar que o arquivo nao foi gerado e permitir nova tentativa.
- **ER-004**: Falhas de exportacao devem ser tratadas de forma imediata na tela atual (sem processamento assincrono), preservando os filtros para nova tentativa.
- **EV-001**: Se nao houver resultados, o sistema deve exibir estado vazio com explicacao e acao para limpar filtros.

### Permissoes / RBAC

- **Papel permitido**: `org:treasurer`, `org:manager`, `org:admin`.
- **Papel bloqueado**: `org:member`.
- **Regra de acesso**: visualizacao e exportacao seguem a mesma matriz de permissao.
- **Regra de acao por papel**: `org:manager` opera em modo somente leitura (consultar e exportar).
- **Regra de bloqueio**: para `org:member`, resposta esperada e acesso negado com status 403 e mensagem.
- **Regra de isolamento**: usuario autorizado visualiza apenas dados da organizacao ativa.

### Criterios de Aceite Testaveis (Given/When/Then)

- **CA-001**: **Given** cobrancas pendentes com vencimento passado e futuro, **When** o relatorio e carregado, **Then** apenas as vencidas no passado aparecem.
- **CA-002**: **Given** um irmao com tres cobrancas vencidas pendentes, **When** o relatorio consolida dados, **Then** quantidade, total em aberto e cobranca mais antiga estao corretos.
- **CA-003**: **Given** filtros de tipo e periodo definidos, **When** a consulta e executada, **Then** somente cobrancas que satisfazem ambos os filtros sao exibidas.
- **CA-003A**: **Given** periodo de 01/03 a 31/03, **When** a consulta e executada, **Then** cobrancas com vencimento em 01/03 e 31/03 sao incluidas.
- **CA-004**: **Given** uma cobranca com vencimento ha 15 dias, **When** o relatorio e exibido, **Then** o indicador mostra 15 dias em atraso.
- **CA-005**: **Given** relatorio filtrado com resultados, **When** o usuario exporta em CSV e PDF, **Then** os arquivos refletem exatamente os mesmos dados visiveis na tela com secao consolidada por irmao e secao detalhada por cobranca.
- **CA-006**: **Given** usuario com papel `org:member`, **When** tenta abrir a rota do relatorio, **Then** o sistema responde com 403 e mensagem explicativa.
- **CA-007**: **Given** usuario com papel `org:manager`, **When** acessa o relatorio, **Then** consegue apenas consultar e exportar, sem acoes operacionais adicionais.
- **CA-008**: **Given** valor fracionario calculado no total em aberto, **When** exibido na tela/exportacao, **Then** o valor aparece com 2 casas decimais usando arredondamento half-up.
- **CA-009**: **Given** falha na exportacao, **When** o erro ocorre, **Then** o sistema informa falha imediata e permite nova tentativa sem perder filtros.

### Dependencias e Impactos em Modulos Existentes

- **Fonte de dados financeira**: depende dos modulos de cobrancas e cadastro de irmaos para consolidacao de inadimplencia.
- **Acesso organizacional**: depende das regras de papel e organizacao ativa no provedor de autenticacao/autorizacao.
- **Navegacao do dashboard**: requer inclusao/ajuste de permissao de acesso ao item de relatorio no menu de dashboard.
- **Exportacao e auditoria**: impacta mecanismos compartilhados de exportacao de relatorios e registro de eventos auditaveis.
- **Padrao de projeto**: deve seguir App Router, TypeScript strict, Prisma, Clerk (org/role), estrutura feature-based em `src/features/...`, pagina em `src/app/dashboard/...` e padrao visual atual do dashboard.

### Key Entities _(include if feature involves data)_

- **Irmao Inadimplente**: pessoa vinculada a organizacao com pelo menos uma cobranca pendente vencida; atributos de exibicao incluem nome e totais consolidados.
- **Cobranca Vencida**: cobranca com status pendente e vencimento anterior a data atual; atributos de negocio incluem tipo, valor em aberto, vencimento e dias em atraso.
- **Recorte de Relatorio**: conjunto de filtros ativos (tipo e periodo de vencimento) usado para consulta e exportacao consistente.
- **Evento de Exportacao**: registro de auditoria de acao de exportar contendo usuario, organizacao, formato e filtros utilizados.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% das cobrancas exibidas no relatorio cumprem a regra de inadimplencia (status pendente e vencimento anterior a hoje).
- **SC-002**: Em homologacao com massa representativa, ao menos 95% das consultas retornam em ate 3 segundos.
- **SC-003**: Em homologacao com ate 5.000 linhas, ao menos 95% das exportacoes PDF e CSV sao concluidas em ate 10 segundos.
- **SC-004**: 100% das tentativas de acesso por `org:member` ao relatorio e exportacoes sao bloqueadas.
- **SC-005**: Em validacao com usuarios de tesouraria, ao menos 90% concluem os fluxos de filtrar e identificar inadimplentes sem apoio externo.

## Assumptions

- O relatorio usa apenas cobrancas em aberto no momento da consulta; cobrancas quitadas nao entram no calculo.
- O detalhamento por cobranca e visivel na mesma experiencia do relatorio (sem exigir outro modulo para ver dias em atraso).
- O formato visual do PDF segue o padrao dos demais relatorios financeiros ja existentes no produto.
- O limite operacional esperado para uso inicial do relatorio nao ultrapassa 10.000 cobrancas vencidas pendentes por organizacao.
- Nao havera alteracao de regras de negocio de cobranca/pagamento fora do necessario para leitura e consolidacao da inadimplencia.
- O item 3.3 nao introduz trilha de auditoria para visualizacao/filtros alem do registro de exportacoes.
