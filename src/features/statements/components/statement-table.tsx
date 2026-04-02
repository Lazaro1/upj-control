'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IconArrowUpRight, IconArrowDownLeft } from '@tabler/icons-react';
import type { StatementEntry } from '../server/statement.actions';

interface StatementTableProps {
  entries: StatementEntry[];
}

export function StatementTable({ entries }: StatementTableProps) {
  return (
    <div className='bg-card/40 border-border/40 max-w-full min-w-0 overflow-hidden rounded-xl border shadow-xl backdrop-blur-md'>
      <div className='w-full min-w-0'>
        <Table className='w-full table-fixed'>
          <TableHeader className='bg-muted/50'>
            <TableRow>
              <TableHead className='w-[108px]'>Data</TableHead>
              <TableHead className='whitespace-normal'>
                Descrição / Lançamento
              </TableHead>
              <TableHead className='hidden w-[96px] sm:table-cell'>
                Tipo
              </TableHead>
              <TableHead className='hidden w-[140px] lg:table-cell'>
                Status / Método
              </TableHead>
              <TableHead className='w-[132px] text-right'>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground h-32 text-center'
                >
                  Nenhuma transação encontrada para este irmão.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={`${entry.type}-${entry.id}`}
                  className='hover:bg-primary/5 transition-colors'
                >
                  <TableCell className='text-xs font-medium'>
                    {format(new Date(entry.date), "dd 'de' MMM, yyyy", {
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell className='whitespace-normal'>
                    <div className='flex flex-col'>
                      <span className='font-semibold break-words'>
                        {entry.description}
                      </span>
                      <span className='text-muted-foreground text-[10px] tracking-tight break-words uppercase'>
                        {entry.chargeTypeName || 'Pagamento Registrado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    <Badge
                      variant={
                        entry.type === 'payment' ? 'default' : 'secondary'
                      }
                      className='gap-1 px-2 py-0.5 text-[10px]'
                    >
                      {entry.type === 'payment' ? (
                        <>
                          <IconArrowDownLeft size={12} stroke={3} />
                          Crédito
                        </>
                      ) : (
                        <>
                          <IconArrowUpRight size={12} stroke={3} />
                          Débito
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className='hidden whitespace-normal lg:table-cell'>
                    {entry.type === 'charge' ? (
                      <Badge
                        variant='outline'
                        className='text-[10px] capitalize'
                      >
                        {entry.status?.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className='text-xs font-medium text-emerald-600 capitalize dark:text-emerald-400'>
                        {entry.paymentMethod}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${entry.type === 'payment' ? 'text-emerald-500' : 'text-destructive'}`}
                  >
                    {entry.type === 'charge' ? '-' : '+'}
                    {entry.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
