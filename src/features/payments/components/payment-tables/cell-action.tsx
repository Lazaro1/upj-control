'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  IconDotsVertical,
  IconEye,
  IconArrowBackUp
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reversePayment } from '../../server/payment.actions';
import { MIN_REVERSE_REASON_LENGTH } from '../../server/reverse-payment-reason';
import type { PaymentSerializable } from './columns';

export function CellAction({ payment }: { payment: PaymentSerializable }) {
  const router = useRouter();
  const [openReverseDialog, setOpenReverseDialog] = useState(false);
  const [reverseReason, setReverseReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const canReverse = useMemo(
    () => reverseReason.trim().length >= MIN_REVERSE_REASON_LENGTH,
    [reverseReason]
  );

  const onConfirmReverse = async () => {
    try {
      setReversing(true);
      const result = await reversePayment(payment.id, reverseReason);
      if (result.success) {
        toast.success('Pagamento estornado com sucesso.');
        setOpenReverseDialog(false);
        setReverseReason('');
        router.refresh();
        return;
      }

      toast.error(result.error || 'Erro ao estornar pagamento.');
    } catch {
      toast.error('Erro de servidor ao estornar pagamento.');
    } finally {
      setReversing(false);
    }
  };

  return (
    <>
      <AlertDialog
        open={openReverseDialog}
        onOpenChange={(nextOpen) => {
          if (!reversing) {
            setOpenReverseDialog(nextOpen);
            if (!nextOpen) setReverseReason('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estornar pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Este estorno removera o pagamento e suas alocacoes. As cobrancas
              vinculadas terao o status recalculado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2'>
            <Label htmlFor={`reverse-reason-${payment.id}`}>
              Motivo do estorno
            </Label>
            <Textarea
              id={`reverse-reason-${payment.id}`}
              placeholder='Descreva o motivo do estorno (minimo de 10 caracteres).'
              value={reverseReason}
              onChange={(event) => setReverseReason(event.target.value)}
              disabled={reversing}
              className='min-h-24'
            />
            <p className='text-muted-foreground text-xs'>
              Minimo de {MIN_REVERSE_REASON_LENGTH} caracteres.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reversing}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={reversing || !canReverse}
              onClick={onConfirmReverse}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Confirmar estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Abrir menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> Ver Recibo / Detalhes
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenReverseDialog(true)}
            className='text-destructive focus:text-destructive'
          >
            <IconArrowBackUp className='mr-2 h-4 w-4' /> Estornar pagamento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
