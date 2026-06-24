'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IconArrowBackUp } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reversePayment } from '../server/payment.actions';
import { MIN_REVERSE_REASON_LENGTH } from '../server/reverse-payment-reason';

interface ReversePaymentButtonProps {
  paymentId: string;
}

export function ReversePaymentButton({ paymentId }: ReversePaymentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const canReverse = useMemo(
    () => reason.trim().length >= MIN_REVERSE_REASON_LENGTH,
    [reason]
  );

  const onReverse = async () => {
    try {
      setLoading(true);
      const result = await reversePayment(paymentId, reason);

      if (result.success) {
        toast.success('Pagamento estornado com sucesso.');
        setOpen(false);
        setReason('');
        router.push('/dashboard/payments');
        router.refresh();
        return;
      }

      toast.error(result.error || 'Erro ao estornar pagamento.');
    } catch {
      toast.error('Erro de servidor ao estornar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          setOpen(nextOpen);
          if (!nextOpen) setReason('');
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>
          <IconArrowBackUp className='mr-2 h-4 w-4' /> Estornar pagamento
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar estorno do pagamento?</AlertDialogTitle>
          <AlertDialogDescription>
            O estorno removera este pagamento e suas alocacoes, recalculando o
            status das cobrancas relacionadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-2'>
          <Label htmlFor={`reverse-reason-${paymentId}`}>
            Motivo do estorno
          </Label>
          <Textarea
            id={`reverse-reason-${paymentId}`}
            placeholder='Descreva o motivo do estorno (minimo de 10 caracteres).'
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={loading}
            className='min-h-24'
          />
          <p className='text-muted-foreground text-xs'>
            Minimo de {MIN_REVERSE_REASON_LENGTH} caracteres.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading || !canReverse}
            onClick={onReverse}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Confirmar estorno
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
