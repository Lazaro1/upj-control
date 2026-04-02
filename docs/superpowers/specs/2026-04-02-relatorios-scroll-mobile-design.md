# Design Spec: Relatorios mobile scroll horizontal

## Contexto

Nos relatorios do dashboard, as tabelas e o grafico quebram no mobile porque nao ha scroll horizontal acessivel. A pagina de Membros ja possui tabelas responsivas e e a referencia de comportamento: o usuario deve conseguir rolar horizontalmente dentro do container da tabela, sem mover a pagina inteira.

Escopo do ajuste:

- Aplicar padrao responsivo nas tabelas dos relatorios e no grafico de “Por tipo de cobranca”.
- Manter o layout geral e o `PageContainer` inalterados.

Fora de escopo:

- Alterar `PageContainer`/`ScrollArea` globalmente.
- Migrar relatorios para o `DataTable`.

## Objetivo

Garantir scroll horizontal no mobile dentro dos containers das tabelas/grafico de relatorios, espelhando o comportamento responsivo visto em Membros.

## Abordagem (Recomendada)

Criar um wrapper reutilizavel para resultados de relatorios que aplica `overflow-x-auto`, `touch-pan-x` e largura minima no conteudo interno. Esse wrapper sera usado por todas as tabelas dos relatorios e tambem pelo grafico de “Por tipo de cobranca”.

## Componentes impactados

Tabela de relatorios:

- `src/features/reports/components/income-report-table.tsx`
- `src/features/reports/components/expense-report-table.tsx`
- `src/features/reports/components/member-position-table.tsx`
- `src/features/reports/components/delinquency-report-table.tsx`
- `src/features/reports/components/delinquency-report-details.tsx`

Grafico:

- `src/features/reports/components/receipts-by-type-chart.tsx`

Novo wrapper:

- `src/features/reports/components/report-table-wrapper.tsx` (nome sugerido)

## Layout e comportamento

Wrapper do relatorio:

- Container externo: `overflow-x-auto`, `touch-pan-x`, `min-w-0`, `rounded-md`, `border`.
- Conteudo interno: `min-w-[640px]` ou `min-w-[680px]` dependendo da tabela para garantir overflow horizontal no mobile.

Detalhe por componente:

- Tabelas: aplicar `min-w-[680px]` no `<table>`.
- Detalhes de inadimplencia (detalhe): aplicar `min-w-[640px]` no `<table>`.
- Grafico “Por tipo de cobranca”: envolver `ChartContainer` no wrapper e aplicar `min-w-[640px]` no container interno.

## Fluxo de dados

Sem alteracoes. Os dados continuam vindo das actions existentes, apenas a camada de apresentacao recebe o wrapper responsivo.

## Erros, estados vazios e loading

Nenhuma mudanca. Estados atuais de placeholder/erro permanecem.

## Testes / Verificacao

- Manual: abrir `Relatorios` no mobile e confirmar scroll horizontal dentro das tabelas e do grafico.
- Verificar que desktop permanece inalterado.

## Riscos e mitigacao

- Risco: `min-w-*` muito alto pode gerar scroll desnecessario em telas medias.
  - Mitigacao: usar valores consistentes com `DataTable` (ex: 640/680) e manter apenas no container interno.

## Rollback

Reverter o wrapper e remover `min-w-*` caso haja efeitos colaterais.
