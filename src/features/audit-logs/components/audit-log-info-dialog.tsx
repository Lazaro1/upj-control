'use client';

import { IconInfoCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export function AuditLogInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <IconInfoCircle className='mr-2 h-4 w-4' />
          Informações
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Auditoria</DialogTitle>
          <DialogDescription>
            Esta area registra eventos criticos para rastreabilidade e consulta.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 text-sm'>
          <p>
            Cada operacao relevante gera um log com data/hora, ator, acao,
            entidade e identificador.
          </p>
          <p>
            Use os filtros por usuario, acao e periodo para localizar eventos de
            forma rapida.
          </p>
          <p>
            Os registros sao somente leitura: nao e permitido editar ou excluir
            logs de auditoria.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
