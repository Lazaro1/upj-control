'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface AuditLogDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: unknown;
}

export function AuditLogDetailsDrawer({
  open,
  onOpenChange,
  data
}: AuditLogDetailsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] overflow-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Detalhe da auditoria</DialogTitle>
        </DialogHeader>
        <pre className='bg-muted rounded-md p-3 text-xs whitespace-pre-wrap'>
          {JSON.stringify(data, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
