'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { IconArrowUpRight, IconArrowDownLeft, IconWallet, IconCalendarClock } from '@tabler/icons-react';

interface StatementSummaryProps {
  totalCharged: number;
  totalPaid: number;
  pendingAmount: number;
  creditBalance: number;
}

export function StatementSummary({
  totalCharged,
  totalPaid,
  pendingAmount,
  creditBalance
}: StatementSummaryProps) {
  const netBalance = creditBalance - pendingAmount;

  const cards = [
    {
      title: 'Resumo (Saldo)',
      value: netBalance,
      icon: netBalance >= 0 ? IconWallet : IconCalendarClock,
      color: netBalance >= 0 ? 'text-emerald-500' : 'text-destructive',
      description: netBalance >= 0 ? 'Irmão em dia / Com crédito' : 'Débito total pendente'
    },
    {
      title: 'Total Pago',
      value: totalPaid,
      icon: IconArrowDownLeft,
      color: 'text-emerald-500',
      description: 'Recebimentos confirmados'
    },
    {
      title: 'Total Cobrado',
      value: totalCharged,
      icon: IconArrowUpRight,
      color: 'text-blue-500',
      description: 'Acumulado histórico'
    },
    {
      title: 'Crédito Adicional',
      value: creditBalance,
      icon: IconWallet,
      color: creditBalance > 0 ? 'text-emerald-500' : 'text-muted-foreground',
      description: 'Saldo extra em conta'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-2 opacity-15 group-hover:scale-110 transition-transform ${card.color}`}>
              <card.icon size={48} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.title === 'Resumo (Saldo)' ? (netBalance >= 0 ? 'text-emerald-500' : 'text-destructive') : ''}`}>
                {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
