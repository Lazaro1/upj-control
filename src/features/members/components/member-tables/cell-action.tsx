'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
import { IconDotsVertical, IconEdit, IconUserX } from '@tabler/icons-react';
import { deleteMember } from '../../server/member.actions';
import { toast } from 'sonner';
import type { Member } from '@prisma/client';

interface CellActionProps {
  member: any; // Using any for simplicity with serialization, or you could import MemberSerializable
}

export function CellAction({ member }: CellActionProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleInactivate = async () => {
    const result = await deleteMember(member.id);
    if (result.success) {
      toast.success('Membro inativado com sucesso');
    } else {
      toast.error('Erro ao inativar membro');
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Abrir menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/dashboard/members/${member.id}`)
            }
          >
            <IconEdit className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
          {member.status !== 'inativo' && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className='text-destructive'
            >
              <IconUserX className='mr-2 h-4 w-4' />
              Inativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar membro?</AlertDialogTitle>
            <AlertDialogDescription>
              O irmão <strong>{member.fullName}</strong> será marcado como
              inativo. Ele não será excluído do sistema e poderá ser reativado
              posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleInactivate}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
