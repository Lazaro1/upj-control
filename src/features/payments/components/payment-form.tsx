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

import {
  paymentSchema,
  type PaymentFormValues
} from '../schemas/payment.schema';
import {
  createPayment,
  getPendingChargesByMember
} from '../server/payment.actions';
import { formatDbDate } from '@/lib/delinquency';

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
  const totalAllocated = currentAllocations.reduce(
    (sum, a) => sum + a.allocatedAmount,
    0
  );

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

    getPendingChargesByMember(selectedMemberId).then((res) => {
      if (res.success && res.data) {
        setPendingCharges(res.data);
      } else {
        toast.error('Não foi possível carregar as cobranças deste membro.');
      }
      setLoadingCharges(false);
    });
  }, [selectedMemberId, form]);

  const toggleCharge = (charge: any) => {
    const existsIndex = currentAllocations.findIndex(
      (a) => a.chargeId === charge.id
    );
    const newAllocations = [...currentAllocations];

    if (existsIndex >= 0) {
      newAllocations.splice(existsIndex, 1);
    } else {
      newAllocations.push({
        chargeId: charge.id,
        allocatedAmount: charge.remainingAmount
      });
    }

    form.setValue('allocations', newAllocations, { shouldValidate: true });
  };

  const updateAllocationAmount = (
    chargeId: string,
    newAmount: number,
    maxAmount: number
  ) => {
    const clamped = Math.max(0, Math.min(newAmount, maxAmount));
    const newAllocations = currentAllocations.map((a) =>
      a.chargeId === chargeId ? { ...a, allocatedAmount: clamped } : a
    );
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
    <div className='animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-7xl duration-500'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold tracking-tight'>
            Nova Baixa
          </h1>
          <p className='text-muted-foreground mt-1'>
            Registre recebimentos e aloque múltiplos pagamentos de forma fácil.
          </p>
        </div>
        <Button
          variant='outline'
          type='button'
          onClick={() => router.push('/dashboard/payments')}
          className='border-primary/20 hover:bg-primary/5 gap-2 bg-transparent backdrop-blur-md transition-all'
        >
          <IconArrowLeft className='h-4 w-4' />
          Voltar
        </Button>
      </div>

      <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* PAINEL ESQUERDO: DETALHES DO PAGAMENTO */}
          <div className='flex flex-col gap-6 lg:col-span-4'>
            <Card className='border-border/40 bg-card/60 relative overflow-hidden shadow-xl backdrop-blur-2xl'>
              <div className='from-primary to-primary/40 absolute top-0 left-0 h-1 w-full bg-gradient-to-r' />
              <CardContent className='space-y-6 p-6 pt-8'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 text-primary rounded-xl p-2.5'>
                    <IconCreditCard className='h-5 w-5' />
                  </div>
                  <h2 className='text-xl font-semibold'>Recibo</h2>
                </div>

                <FormField
                  control={form.control}
                  name='memberId'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-foreground/70 group-focus-within:text-primary text-sm transition-colors'>
                        Irmão / Pagador
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className='relative'>
                            <SelectTrigger className='bg-background/50 border-border/50 focus:ring-primary/30 h-12 pl-10 transition-all'>
                              <div className='text-muted-foreground absolute left-3'>
                                <IconUser className='h-5 w-5' />
                              </div>
                              <SelectValue placeholder='Buscar membro...' />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent className='max-h-72'>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className='flex flex-col'>
                                <span className='font-medium'>
                                  {m.fullName}
                                </span>
                                <span className='text-xs opacity-70'>
                                  {m.email}
                                </span>
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
                      <FormLabel className='text-foreground/70 group-focus-within:text-primary text-sm transition-colors'>
                        Forma de Pagamento
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='bg-background/50 border-border/50 h-12'>
                            <SelectValue placeholder='Ex: PIX' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='pix'>PIX</SelectItem>
                          <SelectItem value='transferencia'>
                            Transferência Bancária
                          </SelectItem>
                          <SelectItem value='dinheiro'>
                            Dinheiro Espécie
                          </SelectItem>
                          <SelectItem value='boleto'>
                            Boleto Bancário
                          </SelectItem>
                          <SelectItem value='cartao_credito'>
                            Cartão de Crédito
                          </SelectItem>
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
                      <FormLabel className='text-foreground/70 group-focus-within:text-primary text-sm transition-colors'>
                        Data do Recebimento
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <IconCalendarEvent className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
                          <Input
                            type='date'
                            className='bg-background/50 border-border/50 h-12 pl-10'
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
                      <FormLabel className='text-foreground/70 group-focus-within:text-primary text-sm transition-colors'>
                        Anotações Internas
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className='bg-background/50 border-border/50 h-20 resize-none'
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

            <Card className='border-primary/30 bg-primary/5 group relative overflow-hidden shadow-2xl'>
              <div className='from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-50' />
              <CardContent className='relative z-10 flex flex-col items-center justify-center p-6 text-center'>
                <p className='text-primary/80 mb-1 text-sm font-semibold tracking-widest uppercase'>
                  Total a Baixar
                </p>
                <div className='text-foreground mt-2 flex items-baseline gap-1'>
                  <span className='text-2xl font-bold'>R$</span>
                  <motion.span
                    key={totalAllocated}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className='text-5xl font-black tracking-tighter'
                  >
                    {totalAllocated.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </motion.span>
                </div>

                <Button
                  type='submit'
                  disabled={form.formState.isSubmitting || totalAllocated === 0}
                  className='text-md shadow-primary/25 hover:shadow-primary/40 mt-6 h-12 w-full gap-2 font-semibold shadow-lg transition-all hover:scale-[1.02]'
                >
                  <IconDeviceFloppy className='h-5 w-5' />
                  {form.formState.isSubmitting
                    ? 'Processando...'
                    : 'Confirmar Baixa'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PAINEL DIREITO: ALOCAÇÕES */}
          <div className='lg:col-span-8'>
            <Card className='border-border/40 bg-card/40 h-full min-h-[500px] shadow-lg backdrop-blur-xl'>
              <CardContent className='p-6'>
                <div className='border-border/50 mb-6 flex items-center justify-between border-b pb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-xl bg-orange-500/10 p-2.5 text-orange-500'>
                      <IconReceipt2 className='h-5 w-5' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold tracking-tight'>
                        Cobranças Pendentes
                      </h2>
                      <p className='text-muted-foreground text-sm'>
                        Selecione quais débitos compõem este pagamento.
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedMemberId ? (
                  <div className='text-muted-foreground/60 flex h-[300px] flex-col items-center justify-center space-y-4'>
                    <div className='bg-muted/30 rounded-full p-4'>
                      <IconUser className='h-12 w-12 opacity-50' />
                    </div>
                    <p className='text-lg'>
                      Selecione um membro para visualizar os débitos.
                    </p>
                  </div>
                ) : loadingCharges ? (
                  <div className='text-primary/60 flex h-[300px] flex-col items-center justify-center space-y-4'>
                    <IconLoader2 className='h-10 w-10 animate-spin' />
                    <p className='animate-pulse font-medium'>
                      Buscando histórico financeiro...
                    </p>
                  </div>
                ) : pendingCharges.length === 0 ? (
                  <div className='flex h-[300px] flex-col items-center justify-center space-y-4 text-emerald-500/60'>
                    <div className='rounded-full bg-emerald-500/10 p-4'>
                      <IconCircleCheck className='h-12 w-12' />
                    </div>
                    <p className='text-lg font-medium text-emerald-600 dark:text-emerald-400'>
                      Nenhum débito pendente encontrado!
                    </p>
                    <p className='text-muted-foreground text-center text-sm'>
                      Este irmão está em dia com a tesouraria.
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <AnimatePresence>
                      {pendingCharges.map((charge, i) => {
                        const isSelected = currentAllocations.some(
                          (a) => a.chargeId === charge.id
                        );
                        const allocation = currentAllocations.find(
                          (a) => a.chargeId === charge.id
                        );
                        const remainingAfter =
                          charge.remainingAmount -
                          (allocation?.allocatedAmount ?? 0);
                        const isWarning = new Date(charge.dueDate) < new Date();

                        return (
                          <motion.div
                            key={charge.id}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all duration-200 ${
                              isSelected
                                ? 'border-primary bg-primary/5 scale-[1.01] shadow-md'
                                : 'border-border/60 bg-background/50 hover:border-primary/40 hover:bg-background/80 hover:shadow-sm'
                            } `}
                            onClick={() => toggleCharge(charge)}
                          >
                            {/* Background Gradient Effect when selected */}
                            {isSelected && (
                              <div className='from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent' />
                            )}

                            <div className='relative z-10 flex items-start justify-between'>
                              <div className='min-w-0 flex-1 space-y-1.5'>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant={
                                      charge.status === 'parcialmente_paga'
                                        ? 'secondary'
                                        : isWarning
                                          ? 'destructive'
                                          : 'outline'
                                    }
                                    className='text-[10px] font-bold tracking-wider uppercase'
                                  >
                                    {charge.status === 'parcialmente_paga'
                                      ? 'Parcial'
                                      : isWarning
                                        ? 'Vencida'
                                        : 'Pendente'}
                                  </Badge>
                                  <span className='text-sm font-medium opacity-80'>
                                    {charge.chargeTypeName}
                                  </span>
                                </div>
                                <h3 className='text-lg font-bold tracking-tight'>
                                  R${' '}
                                  {charge.remainingAmount.toLocaleString(
                                    'pt-BR',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </h3>
                                <p className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                                  <IconCalendarEvent className='h-3.5 w-3.5' />
                                  Venc: {formatDbDate(charge.dueDate)}
                                </p>
                              </div>
                              <div
                                className={`ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/30'} `}
                              >
                                {isSelected ? (
                                  <IconCheckbox className='h-6 w-6' />
                                ) : (
                                  <IconSquare className='h-6 w-6' />
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className='mt-3 space-y-2'>
                                <div className='text-muted-foreground flex items-center justify-between text-xs'>
                                  <span>
                                    Original: R${' '}
                                    {charge.amount.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2
                                    })}
                                  </span>
                                  <span>
                                    Já pago: R${' '}
                                    {charge.alreadyPaid.toLocaleString(
                                      'pt-BR',
                                      { minimumFractionDigits: 2 }
                                    )}
                                  </span>
                                </div>
                                <div className='relative'>
                                  <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium'>
                                    R$
                                  </span>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    min={0}
                                    max={charge.remainingAmount}
                                    value={allocation?.allocatedAmount ?? 0}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      updateAllocationAmount(
                                        charge.id,
                                        isNaN(val) ? 0 : val,
                                        charge.remainingAmount
                                      );
                                    }}
                                    className='bg-background/80 border-primary/30 text-foreground focus-visible:ring-primary/30 h-10 pr-4 pl-10 font-semibold'
                                  />
                                </div>
                                <p className='text-muted-foreground flex justify-between text-xs'>
                                  <span>Saldo restante após baixa:</span>
                                  <span
                                    className={
                                      remainingAfter < 0.01
                                        ? 'font-medium text-emerald-500'
                                        : 'font-medium text-amber-500'
                                    }
                                  >
                                    R${' '}
                                    {remainingAfter.toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2
                                    })}
                                  </span>
                                </p>
                              </div>
                            )}

                            {!isSelected && charge.alreadyPaid > 0 && (
                              <div className='border-border/50 mt-3 flex items-center gap-1 border-t pt-3 text-xs opacity-70'>
                                <IconInfoCircle className='h-3.5 w-3.5' />
                                Já foi pago{' '}
                                <b>
                                  R${' '}
                                  {charge.alreadyPaid.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2
                                  })}
                                </b>{' '}
                                deste débito.
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
                    className='bg-primary/10 border-primary/20 mt-8 flex items-center justify-between rounded-xl border p-4'
                  >
                    <div className='flex items-center gap-3'>
                      <IconCoin className='text-primary h-5 w-5' />
                      <span className='text-primary font-medium'>
                        {currentAllocations.length}{' '}
                        {currentAllocations.length === 1
                          ? 'débito selecionado'
                          : 'débitos selecionados'}
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
