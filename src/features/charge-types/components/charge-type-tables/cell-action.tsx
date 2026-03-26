'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { deleteChargeType } from '../../server/charge-type.actions';
import { toast } from 'sonner';
import { type ChargeTypeSerializable } from './columns';

interface CellActionProps {
  chargeType: ChargeTypeSerializable;
}

export function CellAction({ chargeType }: CellActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    router.push(`/dashboard/charge-types/${chargeType.id}`);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja inativar este tipo de cobrança?')) {
      startTransition(async () => {
        const result = await deleteChargeType(chargeType.id);
        if (result.success) {
          toast.success('Tipo de cobrança inativado com sucesso.');
          router.refresh();
        } else {
          toast.error('Ocorreu um erro ao inativar.');
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' disabled={isPending}>
          <span className='sr-only'>Abrir menu</span>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleEdit}>
          <IconEdit className='mr-2 h-4 w-4' /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className='text-destructive focus:text-destructive'>
          <IconTrash className='mr-2 h-4 w-4' /> Inativar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
