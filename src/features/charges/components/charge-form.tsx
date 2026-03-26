'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  IconReceipt2,
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconCalendarEvent,
  IconCoin
} from '@tabler/icons-react';

import { chargeFormSchema, type ChargeFormValues } from '../schemas/charge.schema';
import { createCharge, updateCharge } from '../server/charge.actions';

interface ChargeFormProps {
  initialData?: any;
  members: { id: string; fullName: string }[];
  chargeTypes: { id: string; name: string; defaultAmount: number | null }[];
}

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

export function ChargeForm({ initialData, members, chargeTypes }: ChargeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const isStatusLocked = isEditing && initialData.status !== 'pendente';

  const form = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          amount: Number(initialData.amount),
          competenceDate: initialData.competenceDate?.split('T')[0] || '',
          dueDate: initialData.dueDate?.split('T')[0] || '',
          description: initialData.description || ''
        }
      : {
          memberId: '',
          chargeTypeId: '',
          amount: 0,
          competenceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          status: 'pendente',
          description: ''
        }
  });

  // Helper to sync default amount when charge type is selected
  const onChargeTypeChange = (typeId: string) => {
    form.setValue('chargeTypeId', typeId);
    
    // Only auto-fill if not editing, or if editing but wanting to switch type freely
    if (!isEditing) {
      const selectedType = chargeTypes.find(t => t.id === typeId);
      if (selectedType && selectedType.defaultAmount) {
        form.setValue('amount', Number(selectedType.defaultAmount));
      }
    }
  };

  const onSubmit = async (data: ChargeFormValues) => {
    const result = isEditing
      ? await updateCharge(initialData.id, data)
      : await createCharge(data);

    if (result.success) {
      toast.success(
        isEditing
          ? 'Cobrança atualizada com sucesso'
          : 'Cobrança lançada com sucesso'
      );
      router.push('/dashboard/charges');
      router.refresh();
    } else {
      toast.error(result.error || 'Erro ao salvar cobrança.');
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
        <motion.div variants={itemVariants} className='flex items-center justify-between'>
          <Button 
            variant='ghost' 
            type='button'
            onClick={() => router.push('/dashboard/charges')}
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
                  ? 'Edite os dados desta cobrança.' 
                  : 'Gere uma nova cobrança manual para um membro da loja.'}
                {isStatusLocked && (
                  <span className='block mt-2 text-destructive font-semibold'>
                    Aviso: Como esta cobrança não está mais "Pendente", os valores e as datas essenciais foram bloqueados para edição direta.
                  </span>
                )}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              
              <motion.div variants={itemVariants} className='space-y-6'>
                <div className='flex items-center gap-2 border-b pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <IconReceipt2 className='h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold tracking-tight'>Dados da Cobrança</h3>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                  <FormField
                    control={form.control}
                    name='memberId'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-6 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Irmão</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isEditing} // Não muda pra quem faturou depois de salvo
                        >
                          <FormControl>
                            <div className='relative flex items-center'>
                              <div className='pointer-events-none absolute left-3 z-10 flex items-center text-muted-foreground'>
                                <IconUser className='h-4 w-4' />
                              </div>
                              <SelectTrigger className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'>
                                <SelectValue placeholder='Selecione o membro' />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {members.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='chargeTypeId'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-6 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Tipo de Cobrança</FormLabel>
                        <Select
                          onValueChange={onChargeTypeChange}
                          defaultValue={field.value}
                          disabled={isStatusLocked}
                        >
                          <FormControl>
                            <SelectTrigger className='h-11 bg-background/50 transition-all focus:bg-background'>
                              <SelectValue placeholder='Ex: Mensalidade, Evento...' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chargeTypes.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='amount'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Valor Base (R$)</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconCoin className='h-4 w-4' />
                            </div>
                            <Input 
                              type='number'
                              step='0.01'
                              min='0'
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                              disabled={isStatusLocked}
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='competenceDate'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Mês de Competência</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconCalendarEvent className='h-4 w-4' />
                            </div>
                            <Input 
                              type='date' 
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background w-full'
                              disabled={isStatusLocked}
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
                    name='dueDate'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Data de Vencimento</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconCalendarEvent className='h-4 w-4' />
                            </div>
                            <Input 
                              type='date' 
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background w-full'
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
                    name='description'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-12 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Descrição da Cobrança (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Detalhes adicionais sobre esta cobrança específica...'
                            className='min-h-[80px] resize-none bg-background/50 transition-all focus:bg-background'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </motion.div>

              <Separator className='my-8' />

              <motion.div variants={itemVariants} className='flex flex-col sm:flex-row gap-4 justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/charges')}
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
                    ? 'Processando...'
                    : isEditing
                      ? 'Salvar Cobrança'
                      : 'Lançar Cobrança'}
                </Button>
              </motion.div>

            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
