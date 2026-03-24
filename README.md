# UPJ Control - Sistema de Tesouraria

Sistema de gestão financeira focado no controle de tesouraria de Lojas Maçônicas.
Desenvolvido sobre o boilerplate [Next.js Admin Dashboard Starter](https://github.com/Kiranism/next-shadcn-dashboard-starter).

## Visão Geral

O projeto visa digitalizar e automatizar o processo financeiro da tesouraria, focando no controle de membros, pagamentos, cobranças recorrentes, multas e relatórios consolidados de caixa para a diretoria.

A documentação detalhada (regras de negócio, fases de criação e arquitetura técnica) está centralizada na pasta `docs/`:
- [Plano de Criação da Tesouraria](./docs/plano-criacao-tesouraria.md)

## Em que a base nos ajuda?

O boilerplate atual traz resolvido as partes mais completas de SaaS com as seguintes integrações:
- Framework: Next.js 16 (App Router) e React 19
- Estilos e UI: Shadcn UI + Tailwind CSS v4 + Temas variados
- Listagens Complexas: TanStack Data Tables com paginação e ordenação robustas (Server-side search)
- Autenticação e Multi-Loja (Tenant): Clerk Auth + Clerk Organizations ativados de fábrica
- Componentes Ricos: Dashboards reativos com Recharts

A partir dessa base, construiremos toda a lógica financeira local da Loja utilizando Prisma + PostgreSQL para os lançamentos, garantindo a rastreabilidade via auditorias locais.

## Como Rodar Localmente

1. Tenha certeza de configurar suas chaves do Clerk (Auth) localmente e os acessos ao banco de dados PostgreSQL.
2. Copie os exemplos de `.env`:
   ```bash
   cp env.example.txt .env.local
   ```
3. Instale as dependências com `bun`:
   ```bash
   bun install
   ```
4. Suba o banco de dados e rode as migrations do Prisma:
   ```bash
   # (Ex) npx prisma migrate dev
   ```
5. Inicie a aplicação:
   ```bash
   bun run dev
   ```

A aplicação subirá em [http://localhost:3000](http://localhost:3000) e você já poderá ver a interface administrativa do dashboard de Tesouraria e testar o login.
