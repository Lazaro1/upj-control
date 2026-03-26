import { getMemberStatement } from '../server/statement.actions';
import { StatementSummary } from './statement-summary';
import { StatementTable } from './statement-table';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconPrinter, IconFileText } from '@tabler/icons-react';
import Link from 'next/link';

interface StatementViewProps {
  memberId: string;
}

export async function StatementView({ memberId }: StatementViewProps) {
  const result = await getMemberStatement(memberId);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-destructive/10 rounded-xl border border-destructive/20">
        <h2 className="text-xl font-bold text-destructive">Erro ao carregar extrato</h2>
        <p className="text-muted-foreground">{result.error}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/dashboard/members">Voltar aos membros</Link>
        </Button>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extrato Financeiro</h1>
          <p className="text-muted-foreground">Histórico completo de {data.memberName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="backdrop-blur-md bg-transparent border-primary/20 hover:bg-primary/5">
            <Link href="/dashboard/members">
              <IconArrowLeft className="mr-2 h-4 w-4" /> Membros
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="sm"
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <a href={`/api/members/${memberId}/extrato?type=extrato`} download>
              <IconFileText className="h-4 w-4" /> Baixar Extrato (PDF)
            </a>
          </Button>

          <Button 
            asChild 
            variant="default" 
            size="sm"
            className="gap-2 shadow-lg hover:scale-[1.02] transition-transform bg-primary"
          >
            <a href={`/api/members/${memberId}/extrato?type=ficha`} download>
              <IconPrinter className="h-4 w-4" /> Ficha do Irmão (PDF)
            </a>
          </Button>
        </div>
      </div>

      <StatementSummary
        totalCharged={data.totalCharged}
        totalPaid={data.totalPaid}
        pendingAmount={data.pendingAmount}
        creditBalance={data.creditBalance}
      />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Lançamentos Recentes</h3>
        <p className="text-xs text-muted-foreground italic">* Valores negativos (-) indicam débitos/cobranças.</p>
      </div>

      <StatementTable entries={data.entries} />
    </div>
  );
}
