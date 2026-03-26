'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IconDotsVertical, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
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
import { cancelCharge } from '../../server/charge.actions';
import type { ChargeSerializable } from './columns';

interface CellActionProps {
  charge: ChargeSerializable;
}

export function CellAction({ charge }: CellActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCancelable = charge.status === 'pendente';

  const onConfirmCancel = async () => {
    try {
      setLoading(true);
      const res = await cancelCharge(charge.id);
      if (res.success) {
        toast.success('Cobrança cancelada com sucesso.');
        router.refresh();
      } else {
        toast.error(res.error || 'Erro ao cancelar cobrança.');
      }
    } catch (error) {
      toast.error('Erro de servidor.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta cobrança de {charge.member.fullName}? 
              Esta ação definirá o status como "cancelada" e a cobrança não será mais devida, mas continuará no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Voltar</AlertDialogCancel>
            <AlertDialogAction disabled={loading} onClick={onConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Cancelamento
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
          
          <DropdownMenuItem onClick={() => router.push(`/dashboard/charges/${charge.id}`)}>
            {charge.status === 'pendente' ? <IconEdit className='mr-2 h-4 w-4' /> : <IconEye className='mr-2 h-4 w-4' />} 
            {charge.status === 'pendente' ? 'Editar' : 'Visualizar'}
          </DropdownMenuItem>
          
          {isCancelable && (
            <DropdownMenuItem 
              onClick={() => setOpen(true)}
              className='text-destructive focus:text-destructive'
            >
              <IconTrash className='mr-2 h-4 w-4' /> Cancelar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
