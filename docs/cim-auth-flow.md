# Fluxo de Autenticação com CIM (Cartão de Identificação Maçônica)

> Documento técnico que descreve o fluxo de segurança adotado para vincular contas Clerk a membros da Tesouraria.

---

## Problema

O sistema precisa garantir que **apenas Irmãos previamente cadastrados pela Tesouraria** consigam acessar o dashboard e o Portal do Irmão. Além disso, é necessário que o vínculo entre a conta Clerk (autenticação) e o registro de membro (dados financeiros) seja feito de forma **segura**, evitando que alguém assuma a conta de outro membro simplesmente por conhecer seu e-mail.

---

## Solução Adotada: Opção B — Vínculo por E-mail + CIM

### Visão Geral

1. O **Tesoureiro** cadastra o Irmão no sistema com seu **e-mail** e **CIM** (Cartão de Identificação Maçônica).
2. O **Irmão** cria uma conta no Clerk normalmente (e-mail e senha).
3. No **primeiro acesso** ao dashboard, o sistema detecta que o e-mail pertence a um membro mas que a conta Clerk ainda não foi vinculada.
4. O Irmão é redirecionado para uma **tela de verificação** onde deve informar seu **CIM**.
5. Se o CIM informado coincidir com o que a Tesouraria cadastrou, o vínculo é estabelecido e o acesso é liberado permanentemente.
6. **Nos acessos seguintes**, o Irmão entra diretamente no dashboard sem precisar informar o CIM novamente.

---

## Diagrama de Fluxo

```
Tesoureiro cadastra membro (email + CIM)
              │
              ▼
Irmão cria conta no Clerk (email/senha)
              │
              ▼
Irmão acessa /dashboard
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
  Member com           Member sem
  clerkUserId?         clerkUserId?
    │                    │
    ▼                    │
 ✅ Acesso              │
   liberado             │
                        │
              ┌─────────┴──────────┐
              │                    │
              ▼                    ▼
        Email existe            Email NÃO
        na tabela               existe na
        members?                tabela members
              │                    │
              ▼                    ▼
     Redireciona para      🚫 Página
     /auth/verify-cim       "Não Autorizado"
              │
              ▼
     Irmão digita o CIM
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
  CIM confere          CIM não confere
    │                    │
    ▼                    ▼
  Vincula              ❌ Mensagem de
  clerkUserId             erro
  ao member               "CIM inválido"
    │
    ▼
 ✅ Redireciona
   para /dashboard
```

---

## Componentes Envolvidos

### 1. `schema.prisma` — Campo `cim`

```prisma
model Member {
  cim  String? @unique
  // ... demais campos
}
```

O CIM é **único** e **opcional** (membros antigos podem não ter CIM preenchido inicialmente).

### 2. Formulário de Membros (`member-form.tsx`)

O Tesoureiro preenche o CIM ao cadastrar ou editar um membro. Esse campo fica na seção "Informações Pessoais".

### 3. Layout do Dashboard (`/dashboard/layout.tsx`)

A verificação de vínculo acontece **no layout server component** do dashboard (e não no middleware), porque:

- O middleware do Next.js roda no **Edge Runtime**, que não suporta Prisma Client diretamente.
- Usar um layout server component permite chamar o Prisma normalmente.
- A verificação roda antes de renderizar qualquer página do dashboard.

**Lógica:**

| Condição | Ação |
|----------|------|
| `Member` encontrado por `clerkUserId` | Acesso liberado |
| `Member` encontrado por email, mas sem `clerkUserId` | Redirect → `/auth/verify-cim` |
| Nenhum `Member` encontrado | Redirect → `/auth/unauthorized` |

### 4. Página de Verificação (`/auth/verify-cim`)

Tela que solicita o CIM do Irmão. Chama uma Server Action que:
1. Busca o membro pelo e-mail da conta Clerk autenticada.
2. Compara o CIM informado com o armazenado no banco.
3. Se válido, grava o `clerkUserId` no registro do membro.

### 5. Página Não Autorizado (`/auth/unauthorized`)

Exibida quando o e-mail do usuário **não existe** na tabela de membros. Indica que a Tesouraria precisa cadastrá-lo primeiro.

---

## Considerações de Segurança

- **O CIM nunca é exposto no frontend** — ele é informado pelo Irmão e validado server-side.
- **Tentativas inválidas** são tratadas com mensagem genérica para não revelar se o CIM existe ou não.
- **O vínculo é permanente** — uma vez que o `clerkUserId` é gravado, não precisa mais do CIM.
- **Dados de outros membros** continuam completamente isolados — cada query no Portal filtra por `memberId` do autenticado.
- **Roles do Clerk** (`org:admin`, `org:treasurer`, `org:member`) controlam a visibilidade de menus e funcionalidades, mas a verificação por CIM é adicional e independente dos roles.

---

## FAQ

**P: E se o Tesoureiro esquecer de cadastrar o CIM?**
R: O campo é opcional no banco. Se o membro não tiver CIM cadastrado, a verificação não será possível e o Irmão verá uma mensagem orientando a entrar em contato com a Tesouraria.

**P: E se o Irmão errar o CIM?**
R: O sistema mostra um erro e permite tentar novamente. Não há limite de tentativas no MVP, mas pode ser adicionado futuramente.

**P: E se o Irmão trocar de e-mail no Clerk?**
R: Como o vínculo é feito pelo `clerkUserId` (e não mais pelo e-mail), trocar o e-mail no Clerk não afeta o acesso após o primeiro vínculo.

**P: O Tesoureiro/Admin também precisa do CIM?**
R: Não. A verificação por CIM é apenas para usuários que ainda não têm `clerkUserId` vinculado. O admin/tesoureiro normalmente já terá o vínculo feito.

---

*Última atualização: 2026-03-26*
