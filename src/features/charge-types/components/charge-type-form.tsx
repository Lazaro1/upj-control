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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

  const isRecurring = form.watch('isRecurring');

  return (
    <div className='mx-auto w-full max-w-6xl'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='space-y-6'
      >
        <motion.div
          variants={itemVariants}
          className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'
        >
          <div className='min-w-0'>
            <h1 className='text-3xl font-bold tracking-tight'>
              {isEditing ? 'Editar Tipo de Cobrança' : 'Novo Tipo de Cobrança'}
            </h1>
            <p className='text-muted-foreground mt-1 text-base'>
              {isEditing
                ? 'Atualize as configurações e o comportamento deste tipo de cobrança.'
                : 'Crie uma categoria padronizada para as cobranças da loja.'}
            </p>
          </div>
          <Button
            variant='outline'
            type='button'
            onClick={() => router.push('/dashboard/charge-types')}
            className='border-primary/20 hover:bg-primary/5 shrink-0 gap-2 backdrop-blur-md'
          >
            <IconArrowLeft className='h-4 w-4' />
            Voltar
          </Button>
        </motion.div>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch'>
            {/* Coluna esquerda: identificação */}
            <motion.div variants={itemVariants} className='flex lg:col-span-7'>
              <Card className='border-border/50 bg-card/40 flex h-full w-full flex-col shadow-lg backdrop-blur-xl'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg'>
                      <IconFileDescription className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>
                        Informações Gerais
                      </CardTitle>
                      <CardDescription>
                        Nome, valor padrão e notas internas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-1 flex-col space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem className='group md:col-span-8'>
                          <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>
                            Nome da Cobrança
                          </FormLabel>
                          <FormControl>
                            <Input
                              className='bg-background/50 focus:bg-background h-11 transition-all'
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
                        <FormItem className='group md:col-span-4'>
                          <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>
                            Valor Padrão
                          </FormLabel>
                          <FormControl>
                            <div className='relative flex items-center'>
                              <div className='text-muted-foreground pointer-events-none absolute left-3 flex items-center'>
                                <IconCurrencyReal className='h-4 w-4' />
                              </div>
                              <Input
                                type='number'
                                step='0.01'
                                min='0'
                                className='bg-background/50 focus:bg-background h-11 pl-9 transition-all'
                                placeholder='0,00'
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
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
                      <FormItem className='group flex flex-1 flex-col'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>
                          Descrição Interna (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Notas sobre quando e como cobrar...'
                            className='bg-background/50 focus:bg-background min-h-[120px] flex-1 resize-none transition-all'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Coluna direita: comportamento e ações */}
            <motion.div variants={itemVariants} className='flex lg:col-span-5'>
              <Card className='border-border/50 bg-card/40 flex h-full w-full flex-col shadow-lg backdrop-blur-xl'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg'>
                      <IconSettings className='h-5 w-5' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>
                        Comportamento Automático
                      </CardTitle>
                      <CardDescription>
                        Recorrência e disponibilidade
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-1 flex-col space-y-4'>
                  <FormField
                    control={form.control}
                    name='isRecurring'
                    render={({ field }) => (
                      <FormItem className='bg-card/30 hover:bg-card/60 flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-colors'>
                        <div className='flex min-w-0 items-center gap-3'>
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500'>
                            <IconRepeat className='h-5 w-5' />
                          </div>
                          <div className='min-w-0 space-y-0.5'>
                            <FormLabel className='cursor-pointer text-base'>
                              Cobrança Recorrente
                            </FormLabel>
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
                      <FormItem className='bg-card/30 hover:bg-card/60 flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm transition-colors'>
                        <div className='flex min-w-0 items-center gap-3'>
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${field.value ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}
                          >
                            <IconCheck className='h-5 w-5' />
                          </div>
                          <div className='min-w-0 space-y-0.5'>
                            <FormLabel className='cursor-pointer text-base'>
                              Tipo Ativo
                            </FormLabel>
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

                  {isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className='border-primary/20 bg-primary/5 space-y-4 overflow-hidden rounded-xl border border-dashed p-4'
                    >
                      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                        Configuração da recorrência
                      </p>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name='frequency'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className='bg-background/50 h-11'>
                                    <SelectValue placeholder='Selecione a frequência' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='monthly'>
                                    Mensal
                                  </SelectItem>
                                  <SelectItem value='quarterly'>
                                    Trimestral
                                  </SelectItem>
                                  <SelectItem value='semiannual'>
                                    Semestral
                                  </SelectItem>
                                  <SelectItem value='annual'>Anual</SelectItem>
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
                                  <div className='text-muted-foreground pointer-events-none absolute left-3 flex items-center'>
                                    <IconCurrencyReal className='h-4 w-4' />
                                  </div>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    min='0'
                                    className='bg-background/50 focus:bg-background h-11 pl-9 transition-all'
                                    placeholder='0,00'
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? parseFloat(e.target.value)
                                          : undefined
                                      )
                                    }
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
                      </div>
                    </motion.div>
                  )}

                  <div className='border-border/50 mt-auto flex flex-col gap-3 border-t pt-6'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.push('/dashboard/charge-types')}
                      className='h-11 w-full'
                    >
                      Cancelar
                    </Button>
                    <Button
                      type='submit'
                      disabled={form.formState.isSubmitting}
                      className='h-11 w-full shadow-md transition-all hover:shadow-lg'
                    >
                      <IconDeviceFloppy className='mr-2 h-5 w-5' />
                      {form.formState.isSubmitting
                        ? 'Salvando...'
                        : isEditing
                          ? 'Salvar Alterações'
                          : 'Cadastrar Tipo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Form>
      </motion.div>
    </div>
  );
}
