'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
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
import { Badge } from '@/components/ui/badge';
import {
  IconDeviceFloppy,
  IconArrowLeft,
  IconUser,
  IconCalendarEvent,
  IconReceipt2,
  IconCircleCheck,
  IconCoin,
  IconCreditCard,
  IconLoader2,
  IconInfoCircle,
  IconCheckbox,
  IconSquare
} from '@tabler/icons-react';

import { paymentSchema, type PaymentFormValues } from '../schemas/payment.schema';
import { createPayment, getPendingChargesByMember } from '../server/payment.actions';

interface PaymentFormProps {
  members: { id: string; fullName: string; email: string }[];
}

export function PaymentForm({ members }: PaymentFormProps) {
  const router = useRouter();
  const [pendingCharges, setPendingCharges] = useState<any[]>([]);
  const [loadingCharges, setLoadingCharges] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: '',
      paymentMethod: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      notes: '',
      allocations: []
    }
  });

  const selectedMemberId = form.watch('memberId');
  const currentAllocations = form.watch('allocations');
  const totalAllocated = currentAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

  // Sync amount field with allocated sum automatically for usability
  useEffect(() => {
    form.setValue('amount', totalAllocated, { shouldValidate: true });
  }, [totalAllocated, form]);

  useEffect(() => {
    if (!selectedMemberId) {
      setPendingCharges([]);
      form.setValue('allocations', []);
      return;
    }

    setLoadingCharges(true);
    form.setValue('allocations', []); // Reset on member change
    
    getPendingChargesByMember(selectedMemberId).then(res => {
      if (res.success && res.data) {
        setPendingCharges(res.data);
      } else {
        toast.error('Não foi possível carregar as cobranças deste membro.');
      }
      setLoadingCharges(false);
    });
  }, [selectedMemberId, form]);

  const toggleCharge = (charge: any) => {
    const existsIndex = currentAllocations.findIndex(a => a.chargeId === charge.id);
    const newAllocations = [...currentAllocations];
    
    if (existsIndex >= 0) {
      newAllocations.splice(existsIndex, 1);
    } else {
      newAllocations.push({ chargeId: charge.id, allocatedAmount: charge.remainingAmount });
    }
    
    form.setValue('allocations', newAllocations, { shouldValidate: true });
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (data.allocations.length === 0) {
      toast.error('Você deve selecionar pelo menos uma cobrança para baixar.');
      return;
    }

    const res = await createPayment(data);
    if (res.success) {
      toast.success('Baixa registrada com sucesso!');
      router.push('/dashboard/payments');
      router.refresh();
    } else {
      toast.error(res.error || 'Erro ao registrar pagamento.');
    }
  };

  return (
    <div className='mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>Nova Baixa</h1>
          <p className='text-muted-foreground mt-1'>Registre recebimentos e aloque múltiplos pagamentos de forma fácil.</p>
        </div>
        <Button 
          variant='outline' 
          type='button'
          onClick={() => router.push('/dashboard/payments')}
          className='gap-2 backdrop-blur-md bg-transparent border-primary/20 hover:bg-primary/5 transition-all'
        >
          <IconArrowLeft className='h-4 w-4' />
          Voltar
        </Button>
      </div>

      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          
          {/* PAINEL ESQUERDO: DETALHES DO PAGAMENTO */}
          <div className='lg:col-span-4 flex flex-col gap-6'>
            <Card className='border-border/40 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden relative'>
              <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40' />
              <CardContent className='p-6 space-y-6 pt-8'>
                <div className='flex items-center gap-3'>
                  <div className='p-2.5 rounded-xl bg-primary/10 text-primary'>
                    <IconCreditCard className='h-5 w-5' />
                  </div>
                  <h2 className='text-xl font-semibold'>Recibo</h2>
                </div>

                <FormField
                  control={form.control}
                  name='memberId'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Irmão / Pagador</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <div className='relative'>
                            <SelectTrigger className='h-12 bg-background/50 border-border/50 transition-all focus:ring-primary/30 pl-10'>
                              <div className='absolute left-3 text-muted-foreground'>
                                <IconUser className='h-5 w-5' />
                              </div>
                              <SelectValue placeholder='Buscar membro...' />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className='max-h-72'>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className='flex flex-col'>
                                <span className='font-medium'>{m.fullName}</span>
                                <span className='text-xs opacity-70'>{m.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='paymentMethod'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Forma de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='h-12 bg-background/50 border-border/50'>
                            <SelectValue placeholder='Ex: PIX' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='pix'>PIX</SelectItem>
                          <SelectItem value='transferencia'>Transferência Bancária</SelectItem>
                          <SelectItem value='dinheiro'>Dinheiro Espécie</SelectItem>
                          <SelectItem value='boleto'>Boleto Bancário</SelectItem>
                          <SelectItem value='cartao_credito'>Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='paymentDate'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Data do Recebimento</FormLabel>
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
                  name='notes'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-sm text-foreground/70 group-focus-within:text-primary transition-colors'>Anotações Internas</FormLabel>
                      <FormControl>
                        <Textarea 
                          className='resize-none h-20 bg-background/50 border-border/50' 
                          placeholder='Código transação PIX, obs...'
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            <Card className='border-primary/30 bg-primary/5 shadow-2xl overflow-hidden relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50' />
              <CardContent className='p-6 relative z-10 flex flex-col items-center justify-center text-center'>
                <p className='text-sm uppercase tracking-widest text-primary/80 font-semibold mb-1'>Total a Baixar</p>
                <div className='flex items-baseline gap-1 mt-2 text-foreground'>
                  <span className='text-2xl font-bold'>R$</span>
                  <motion.span 
                    key={totalAllocated}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className='text-5xl font-black tracking-tighter'
                  >
                    {totalAllocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </motion.span>
                </div>
                
                <Button 
                  type='submit' 
                  disabled={form.formState.isSubmitting || totalAllocated === 0}
                  className='w-full mt-6 h-12 text-md font-semibold gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40'
                >
                  <IconDeviceFloppy className='h-5 w-5' />
                  {form.formState.isSubmitting ? 'Processando...' : 'Confirmar Baixa'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PAINEL DIREITO: ALOCAÇÕES */}
          <div className='lg:col-span-8'>
             <Card className='h-full min-h-[500px] border-border/40 bg-card/40 backdrop-blur-xl shadow-lg'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-6 pb-4 border-b border-border/50'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2.5 rounded-xl bg-orange-500/10 text-orange-500'>
                        <IconReceipt2 className='h-5 w-5' />
                      </div>
                      <div>
                        <h2 className='text-xl font-semibold tracking-tight'>Cobranças Pendentes</h2>
                        <p className='text-sm text-muted-foreground'>Selecione quais débitos compõem este pagamento.</p>
                      </div>
                    </div>
                  </div>

                  {!selectedMemberId ? (
                    <div className='flex flex-col items-center justify-center h-[300px] text-muted-foreground/60 space-y-4'>
                      <div className='p-4 rounded-full bg-muted/30'>
                        <IconUser className='h-12 w-12 opacity-50' />
                      </div>
                      <p className='text-lg'>Selecione um membro para visualizar os débitos.</p>
                    </div>
                  ) : loadingCharges ? (
                    <div className='flex flex-col items-center justify-center h-[300px] text-primary/60 space-y-4'>
                      <IconLoader2 className='h-10 w-10 animate-spin' />
                      <p className='animate-pulse font-medium'>Buscando histórico financeiro...</p>
                    </div>
                  ) : pendingCharges.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-[300px] text-emerald-500/60 space-y-4'>
                      <div className='p-4 rounded-full bg-emerald-500/10'>
                        <IconCircleCheck className='h-12 w-12' />
                      </div>
                      <p className='text-lg font-medium text-emerald-600 dark:text-emerald-400'>Nenhum débito pendente encontrado!</p>
                      <p className='text-sm text-center text-muted-foreground'>Este irmão está em dia com a tesouraria.</p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <AnimatePresence>
                        {pendingCharges.map((charge, i) => {
                          const isSelected = currentAllocations.some(a => a.chargeId === charge.id);
                          const isWarning = new Date(charge.dueDate) < new Date();
                          
                          return (
                            <motion.div
                              key={charge.id}
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              className={`
                                relative p-5 rounded-2xl border-2 cursor-pointer
                                transition-all duration-200 overflow-hidden
                                ${isSelected 
                                  ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                                  : 'border-border/60 bg-background/50 hover:border-primary/40 hover:bg-background/80 hover:shadow-sm'
                                }
                              `}
                              onClick={() => toggleCharge(charge)}
                            >
                              {/* Background Gradient Effect when selected */}
                              {isSelected && (
                                <div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none' />
                              )}
                              
                              <div className='flex items-start justify-between relative z-10'>
                                <div className='space-y-1.5'>
                                  <div className='flex items-center gap-2'>
                                    <Badge variant={charge.status === 'parcialmente_paga' ? 'secondary' : isWarning ? 'destructive' : 'outline'} className='text-[10px] uppercase font-bold tracking-wider'>
                                      {charge.status === 'parcialmente_paga' ? 'Parcial' : isWarning ? 'Vencida' : 'Pendente'}
                                    </Badge>
                                    <span className='text-sm font-medium opacity-80'>{charge.chargeTypeName}</span>
                                  </div>
                                  <h3 className='font-bold text-lg tracking-tight'>
                                    R$ {charge.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </h3>
                                  <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
                                    <IconCalendarEvent className='h-3.5 w-3.5' />
                                    Venc: {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <div className={`
                                  flex items-center justify-center h-6 w-6 rounded-md transition-colors
                                  ${isSelected ? 'text-primary' : 'text-muted-foreground/30'}
                                `}>
                                  {isSelected ? <IconCheckbox className='h-6 w-6' /> : <IconSquare className='h-6 w-6' />}
                                </div>
                              </div>
                              
                              {charge.alreadyPaid > 0 && (
                                <div className='mt-3 pt-3 border-t border-border/50 text-xs flex items-center gap-1 opacity-70'>
                                  <IconInfoCircle className='h-3.5 w-3.5' />
                                  Já foi pago <b>R$ {charge.alreadyPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b> deste débito.
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {currentAllocations.length > 0 && (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className='mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between'
                     >
                       <div className='flex items-center gap-3'>
                         <IconCoin className='h-5 w-5 text-primary' />
                         <span className='font-medium text-primary'>
                           {currentAllocations.length} {currentAllocations.length === 1 ? 'débito selecionado' : 'débitos selecionados'}
                         </span>
                       </div>
                     </motion.div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
