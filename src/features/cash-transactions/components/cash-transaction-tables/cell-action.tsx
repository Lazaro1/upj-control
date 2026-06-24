'use client';

import { IconCopy, IconDotsVertical } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { CashTransactionSerializable } from './columns';
import { toast } from 'sonner';

interface CellActionProps {
  transaction: CashTransactionSerializable;
}

export function CellAction({ transaction }: CellActionProps) {
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      toast.success('ID do lançamento copiado.');
    } catch {
      toast.error('Não foi possível copiar o ID.');
    }
  };

  return (
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
        <DropdownMenuItem onClick={handleCopyId}>
          <IconCopy className='mr-2 h-4 w-4' /> Copiar ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
