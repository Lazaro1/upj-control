# Padrões de Interface para Formulários (UI/UX)

Este documento estabelece as diretrizes visuais e arquiteturais para a criação de novos formulários (Forms) dentro do sistema UPJ Control. O objetivo é evitar o padrão "empilhado/genérico" e oferecer um design refinado, fluido, interativo e com estética premium (*glassmorphism*).

## 1. Princípios de Layout Base

**Nunca limite excessivamente a largura horizontal do form sem necessidade.** Ao invés de um `max-w-xl` centralizado e restrito a uma coluna vertical, dê preferência ao aproveitamento total do container da página.

```tsx
// Correto: Permite que a grade interna decida como preencher o espaço horizontal
<div className='mx-auto w-full'>
  <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
```

## 2. Animação de Entrada (Framer Motion)

Todos os forms principais devem ter um efeito de `stagger` (cascata) que revela os inputs e seções sequencialmente no primeiro carregamento.

```tsx
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Implementação base:
<motion.div initial='hidden' animate='visible' variants={containerVariants} className='space-y-6'>
  {/* Utilize variants={itemVariants} em cada sub-seção ou campo. */}
  <motion.div variants={itemVariants}>
```

## 3. Divisão em Seções

Evite campos monolíticos soltos pelo formulário. Adote agrupamentos lógicos (ex: "Dados Pessoais", "Configurações Técnicas"). Cada grupo inicia com um cabeçalho distintivo:

```tsx
<div className='flex items-center gap-2 border-b pb-2'>
  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
    <IconSuaEscolha className='h-5 w-5' />
  </div>
  <h3 className='text-lg font-semibold tracking-tight'>Informações Principais</h3>
</div>
```

## 4. Grade Flexível (`grid-cols-12`)

Sempre procure posicionar blocos de forma inteligente na horizontal em monitores grandes. A `grid-cols-12` é o padrão ouro. Exemplo de ocupação: Nome 7/12 e Email 5/12.

```tsx
<div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
  <FormField
    name='nome'
    render={({ field }) => (
      <FormItem className='col-span-1 md:col-span-7 group'>
      ...
```

## 5. Micro-Interações e Elementos Visuais dos Campos

Cada `FormField` deve prover um feedback claro (Hover & Focus):

- **Label Dinâmico**: O label deve destacar sua cor ao ter o input focado. Isso pede o sufixo `group` em `FormItem` e um seletor visual na label.
- **Backgrounds do Input**: Usar `bg-background/50` para manter contraste sutil ao vidro do Card, que fica sólido durante o focus.

```tsx
<FormItem className='group'>
  <FormLabel className='text-foreground/80 transition-colors group-focus-within:text-primary'>
    Nome Completo
  </FormLabel>
  <FormControl>
    <Input className='h-11 bg-background/50 transition-all focus:bg-background' />
  </FormControl>
</FormItem>
```

### Ícones Internos (Left Icon)
Sempre que pertinente, use ícones internamente à esquerda do Placeholder do field usando relativismo.

```tsx
<div className='relative flex items-center'>
  <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
    <IconSuaEscolha className='h-4 w-4' />
  </div>
  <Input className='h-11 pl-9 bg-background/50 transition-all focus:bg-background' />
</div>
```

## 6. Configurações Dinâmicas (Switches Modernizados)

Para configurações booleanas, prefira transformá-las em mini-cards clicáveis interativos em vez de checkmarks descontextualizados:

```tsx
<FormItem className='flex flex-row items-center justify-between rounded-xl border bg-card/30 p-4 shadow-sm transition-colors hover:bg-card/60'>
  <div className='flex items-center gap-4'>
    {/* Ícone contextual: Ativo/Sucesso pode usar Emerald, Outros status usam Primary ou Blue */}
    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500'>
      <IconAlgum className='h-5 w-5' />
    </div>
    <div className='space-y-0.5'>
      <FormLabel className='text-base cursor-pointer'>Configuração</FormLabel>
      <FormDescription className='text-xs'>Detalhes da configuração</FormDescription>
    </div>
  </div>
  <FormControl>
    <Switch checked={field.value} onCheckedChange={field.onChange} />
  </FormControl>
</FormItem>
```

## 7. Ações de Envio

Botões de submit devem ser proeminentes, possuir espaçamento confortável (`h-11 px-8`) e efeitos sutis de sombra/escurecimento ao toque.

```tsx
<Button 
  type='submit' 
  className='h-11 px-8 shadow-md transition-all hover:shadow-lg'
>
  <IconDeviceFloppy className='mr-2 h-5 w-5' />
  Salvar
</Button>
```
