'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[120px]">Data</TableHead>
            <TableHead>Descrição / Lançamento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status / Método</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                Nenhuma transação encontrada para este irmão.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={`${entry.type}-${entry.id}`} className="hover:bg-primary/5 transition-colors">
                <TableCell className="font-medium text-xs">
                  {format(new Date(entry.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{entry.description}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                      {entry.chargeTypeName || 'Pagamento Registrado'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={entry.type === 'payment' ? 'default' : 'secondary'}
                    className="gap-1 px-2 py-0.5 text-[10px]"
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
                <TableCell>
                  {entry.type === 'charge' ? (
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {entry.status?.replace('_', ' ')}
                    </Badge>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                      {entry.paymentMethod}
                    </span>
                  )}
                </TableCell>
                <TableCell className={`text-right font-bold ${entry.type === 'payment' ? 'text-emerald-500' : 'text-destructive'}`}>
                  {entry.type === 'charge' ? '-' : '+'}
                  {entry.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
