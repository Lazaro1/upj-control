'use client';

import { useRouter } from 'next/navigation';
import { IconDotsVertical, IconEye } from '@tabler/icons-react';
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

interface CellActionProps {
  transaction: CashTransactionSerializable;
}

export function CellAction({ transaction }: CellActionProps) {
  const router = useRouter();

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
        
        {/* <DropdownMenuItem onClick={() => router.push(`/dashboard/cash-transactions/${transaction.id}`)}>
          <IconEye className='mr-2 h-4 w-4' /> Visualizar
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
