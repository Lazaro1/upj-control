---
title: Relatorios Financeiros - Mobile Tabs Selector
date: 2026-04-02
owner: OpenCode
status: approved
---

# Relatorios Financeiros - Mobile Tabs Selector

## Context

O modulo de relatorios financeiros em `/dashboard/reports` usa abas para alternar entre tipos de relatorio. Em mobile, as abas ficam apertadas e a selecao fica menos clara. A prioridade e melhorar a experiencia mobile na escolha do tipo de relatorio, mantendo o comportamento atual no desktop.

## Goal

Melhorar a selecao do tipo de relatorio no mobile substituindo as abas por um seletor compacto, sem alterar logica de dados, filtros ou exportacao.

## Non-Goals

- Alterar filtros de relatorios (datas, tipo de cobranca, etc.).
- Mudar fluxos de exportacao CSV/PDF.
- Alterar RBAC ou rotas.
- Mudar os componentes de tabela ou layout dos dados exibidos.

## Approach Options

1. Select no mobile + Tabs no desktop (escolha recomendada).
2. Tabs rolaveis no mobile com indicador de overflow.
3. Tabs em duas linhas no mobile.

Escolha: opcao 1, por reduzir ocupacao vertical e melhorar a clareza da selecao.

## Design

### 1) Layout

- Desktop/tablet: manter `TabsList` atual e comportamento inalterado.
- Mobile (<= sm): substituir a lista de abas por um `Select` unico rotulado "Tipo de relatorio".
- O seletor controla o mesmo estado `activeTab` usado hoje.

### 2) Comportamento e Interacao

- O `Select` mostra as mesmas opcoes das abas atuais (Entradas, Saidas, Saldo, Por Tipo de Cobranca, Posicao Individual, Inadimplencia).
- Ao trocar o valor do `Select`, o conteudo e os exportes seguem a aba correspondente.
- O texto do periodo atual aparece logo abaixo do `Select`, em estilo muted e menor.
- As acoes de exportacao permanecem como hoje, posicionadas abaixo do periodo para evitar poluicao visual no topo.

### 3) Acessibilidade e Estados

- `Select` com label visivel "Tipo de relatorio".
- `activeTab` segue como fonte unica de verdade para selecao.
- Loading/erro/vazio permanecem iguais aos atuais.

## Components / Files

- `src/features/reports/components/reports-page.tsx`
- Possivel uso de `Select` de `src/components/ui/select` (ja usado no modulo).

## Data Flow

Nenhuma mudanca. Apenas troca de componente de selecao no mobile, mantendo o estado `activeTab` e os handlers existentes.

## Error Handling

Sem alteracoes. Estados de erro continuam nos mesmos blocos existentes.

## Testing

- Verificar mobile: troca de tipo via select muda o conteudo exibido.
- Verificar desktop: tabs continuam funcionando sem regressao.
- Verificar exportacao: botoes continuam aparecendo por aba quando ha dados.

## Risks

- Diferenca de UX entre mobile e desktop (mitigada por comportamento consistente do estado `activeTab`).

## Success Criteria

- Selecao do tipo de relatorio em mobile fica clara e acionavel com um unico controle.
- Nenhuma regressao no desktop.
- Nenhuma alteracao nos dados exibidos ou exportados.
