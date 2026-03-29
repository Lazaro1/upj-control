'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconDeviceFloppy,
  IconArrowLeft,
  IconCalendarEvent
} from '@tabler/icons-react';

import { cashTransactionSchema, type CashTransactionFormValues } from '../schemas/cash-transaction.schema';
import { createCashTransaction } from '../server/cash-transaction.actions';

export function CashTransactionForm() {
  const router = useRouter();

  const form = useForm<CashTransactionFormValues>({
    resolver: zodResolver(cashTransactionSchema),
    defaultValues: {
      type: undefined,
      category: '',
      transactionDate: new Date().toISOString().split('T')[0],
      amount: 0,
      description: ''
    }
  });

  const onSubmit = async (data: CashTransactionFormValues) => {
    const res = await createCashTransaction(data);
    if (res.success) {
      toast.success('Lançamento registrado com sucesso!');
      router.push('/dashboard/cash-transactions');
      router.refresh();
    } else {
      toast.error(res.error || 'Erro ao registrar o lançamento.');
    }
  };

  return (
    <div className='mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>Novo Lançamento</h1>
          <p className='text-muted-foreground mt-1'>Registre uma entrada ou saída no caixa geral.</p>
        </div>
        <Button 
          variant='outline' 
          type='button'
          onClick={() => router.push('/dashboard/cash-transactions')}
          className='gap-2 backdrop-blur-md bg-transparent border-primary/20 hover:bg-primary/5 transition-all'
        >
          <IconArrowLeft className='h-4 w-4' />
          Voltar
        </Button>
      </div>

      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <Card className='border-border/40 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden relative'>
          <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40' />
          <CardContent className='p-6 space-y-6 pt-8'>

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='group'>
                  <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Tipo de Lançamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className='h-12 bg-background/50 border-border/50'>
                        <SelectValue placeholder='Selecione Entrada ou Saída' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='entrada'>Entrada (Receita)</SelectItem>
                      <SelectItem value='saida'>Saída (Despesa)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='group'>
                  <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Categoria</FormLabel>
                  <FormControl>
                    <Input 
                      className='h-12 bg-background/50 border-border/50' 
                      placeholder='Ex: Aluguel, Materiais, Doação...'
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='transactionDate'
                render={({ field }) => (
                  <FormItem className='group'>
                    <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Data da Transação</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <IconCalendarEvent className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
                        <Input 
                          type='date' 
                          className='h-12 pl-10 bg-background/50 border-border/50' 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem className='group'>
                    <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Valor</FormLabel>
                    <FormControl>
                      <Input 
                        type='number' 
                        step='0.01'
                        min='0.01'
                        className='h-12 bg-background/50 border-border/50 font-semibold' 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='group'>
                  <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      className='resize-none h-24 bg-background/50 border-border/50' 
                      placeholder='Detalhes adicionais sobre este lançamento...'
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type='submit' 
              disabled={form.formState.isSubmitting}
              className='w-full h-12 text-md font-semibold gap-2 transition-all hover:scale-[1.02]'
            >
              <IconDeviceFloppy className='h-5 w-5' />
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
            
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
