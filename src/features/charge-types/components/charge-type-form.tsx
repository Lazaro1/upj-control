'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import {
  IconFileDescription,
  IconSettings,
  IconCurrencyReal,
  IconRepeat,
  IconCheck,
  IconDeviceFloppy,
  IconArrowLeft
} from '@tabler/icons-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  chargeTypeSchema,
  type ChargeTypeFormValues
} from '../schemas/charge-type.schema';
import {
  createChargeType,
  updateChargeType
} from '../server/charge-type.actions';
import { type ChargeTypeSerializable } from './charge-type-tables/columns';

interface ChargeTypeFormProps {
  initialData?: ChargeTypeSerializable | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

export function ChargeTypeForm({ initialData }: ChargeTypeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<ChargeTypeFormValues>({
    resolver: zodResolver(chargeTypeSchema),
    defaultValues: initialData
      ? ({
          name: initialData.name,
          description: initialData.description || '',
          defaultAmount: initialData.defaultAmount ?? undefined,
          isRecurring: initialData.isRecurring,
          active: initialData.active,
          frequency: (initialData as any).frequency || 'monthly',
          recurringAmount: (initialData as any).recurringAmount ?? undefined
        } as ChargeTypeFormValues)
      : ({
          name: '',
          description: '',
          defaultAmount: undefined,
          isRecurring: false,
          active: true,
          frequency: 'monthly',
          recurringAmount: undefined
        } as ChargeTypeFormValues)
  });

  const onSubmit = async (data: ChargeTypeFormValues) => {
    const result = isEditing
      ? await updateChargeType(initialData!.id, data)
      : await createChargeType(data);

    if (result.success) {
      toast.success(
        isEditing
          ? 'Tipo de cobrança atualizado com sucesso'
          : 'Tipo de cobrança cadastrado com sucesso'
      );
      router.push('/dashboard/charge-types');
      router.refresh();
    } else {
      toast.error('Erro ao salvar. Verifique os campos.');
    }
  };

  return (
    <div className='mx-auto w-full'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='space-y-6'
      >
        {/* Header Actions */}
        <motion.div variants={itemVariants} className='flex items-center justify-between'>
          <Button 
            variant='ghost' 
            type='button'
            onClick={() => router.push('/dashboard/charge-types')}
            className='gap-2 text-muted-foreground hover:text-foreground'
          >
            <IconArrowLeft className='h-4 w-4' />
            Voltar para lista
          </Button>
        </motion.div>

        <Card className='border-border/50 bg-card/40 backdrop-blur-xl shadow-lg'>
          <CardHeader className='pb-6'>
            <motion.div variants={itemVariants}>
              <CardTitle className='text-3xl font-bold tracking-tight'>
                {isEditing ? 'Editar Cobrança' : 'Nova Cobrança'}
              </CardTitle>
              <CardDescription className='text-base mt-2'>
                {isEditing 
                  ? 'Atualize as configurações e o comportamento deste tipo de cobrança.' 
                  : 'Crie uma nova categoria padronizada para as cobranças da loja.'}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              
              {/* Section 1: General Info */}
              <motion.div variants={itemVariants} className='space-y-6'>
                <div className='flex items-center gap-2 border-b pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <IconFileDescription className='h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold tracking-tight'>Informações Gerais</h3>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-2 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Nome da Cobrança</FormLabel>
                        <FormControl>
                          <Input 
                            className='h-11 bg-background/50 transition-all focus:bg-background' 
                            placeholder='Ex: Mensalidade, Jóia de Iniciação...' 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='defaultAmount'
                    render={({ field }) => (
                      <FormItem className='group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Valor Padrão</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconCurrencyReal className='h-4 w-4' />
                            </div>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                              placeholder='0.00'
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Deixe vazio para valor flexível.
                        </FormDescription>
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
                      <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Descrição Interna (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Notas sobre quando e como cobrar...'
                          className='min-h-[100px] resize-none bg-background/50 transition-all focus:bg-background'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Section 2: Settings */}
              <motion.div variants={itemVariants} className='space-y-6 pt-4'>
                <div className='flex items-center gap-2 border-b pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <IconSettings className='h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold tracking-tight'>Comportamento Automático</h3>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='isRecurring'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-xl border bg-card/30 p-4 shadow-sm transition-colors hover:bg-card/60'>
                        <div className='flex items-center gap-4'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500'>
                            <IconRepeat className='h-5 w-5' />
                          </div>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base cursor-pointer'>Cobrança Recorrente</FormLabel>
                            <FormDescription className='text-xs'>
                              Gera fatura automaticamente
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='active'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-xl border bg-card/30 p-4 shadow-sm transition-colors hover:bg-card/60'>
                        <div className='flex items-center gap-4'>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${field.value ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            <IconCheck className='h-5 w-5' />
                          </div>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base cursor-pointer'>Tipo Ativo</FormLabel>
                            <FormDescription className='text-xs'>
                              Disponível para novos lançamentos
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('isRecurring') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4'
                    >
                      <FormField
                        control={form.control}
                        name='frequency'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className='h-11'>
                                  <SelectValue placeholder="Selecione a frequência" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Mensal</SelectItem>
                                <SelectItem value="quarterly">Trimestral</SelectItem>
                                <SelectItem value="semiannual">Semestral</SelectItem>
                                <SelectItem value="annual">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='recurringAmount'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor por Recorrência</FormLabel>
                            <FormControl>
                              <div className='relative flex items-center'>
                                <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                                  <IconCurrencyReal className='h-4 w-4' />
                                </div>
                                <Input
                                  type='number'
                                  step='0.01'
                                  min='0'
                                  className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                                  placeholder='0.00'
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Se vazio, usará o Valor Padrão.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <Separator className='my-8' />

              {/* Actions */}
              <motion.div variants={itemVariants} className='flex flex-col sm:flex-row gap-4 justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/charge-types')}
                  className='h-11 px-8'
                >
                  Cancelar
                </Button>
                <Button 
                  type='submit' 
                  disabled={form.formState.isSubmitting}
                  className='h-11 px-8 shadow-md transition-all hover:shadow-lg'
                >
                  <IconDeviceFloppy className='mr-2 h-5 w-5' />
                  {form.formState.isSubmitting
                    ? 'Salvando...'
                    : isEditing
                      ? 'Salvar Alterações'
                      : 'Cadastrar Tipo'}
                </Button>
              </motion.div>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
