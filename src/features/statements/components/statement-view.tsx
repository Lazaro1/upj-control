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
      <div className='bg-destructive/10 border-destructive/20 flex flex-col items-center justify-center rounded-xl border p-12'>
        <h2 className='text-destructive text-xl font-bold'>
          Erro ao carregar extrato
        </h2>
        <p className='text-muted-foreground'>{result.error}</p>
        <Button asChild className='mt-4' variant='outline'>
          <Link href='/dashboard/members'>Voltar aos membros</Link>
        </Button>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className='animate-in fade-in slide-in-from-bottom-4 min-w-0 duration-500'>
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Extrato Financeiro
          </h1>
          <p className='text-muted-foreground break-words'>
            Histórico completo de {data.memberName}
          </p>
        </div>
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center'>
          <Button
            asChild
            variant='outline'
            size='sm'
            className='border-primary/20 hover:bg-primary/5 w-full justify-start bg-transparent backdrop-blur-md sm:w-auto sm:justify-center'
          >
            <Link href='/dashboard/members'>
              <IconArrowLeft className='mr-2 h-4 w-4' /> Membros
            </Link>
          </Button>

          <Button
            asChild
            variant='outline'
            size='sm'
            className='border-primary/20 hover:bg-primary/5 w-full justify-start gap-2 sm:w-auto sm:justify-center'
          >
            <a href={`/api/members/${memberId}/extrato?type=extrato`} download>
              <IconFileText className='h-4 w-4' />
              <span className='sm:hidden'>Extrato PDF</span>
              <span className='hidden sm:inline'>Baixar Extrato (PDF)</span>
            </a>
          </Button>

          <Button
            asChild
            variant='default'
            size='sm'
            className='bg-primary w-full justify-start gap-2 shadow-lg transition-transform hover:scale-[1.02] sm:w-auto sm:justify-center'
          >
            <a href={`/api/members/${memberId}/extrato?type=ficha`} download>
              <IconPrinter className='h-4 w-4' />
              <span className='sm:hidden'>Ficha PDF</span>
              <span className='hidden sm:inline'>Ficha do Irmão (PDF)</span>
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

      <div className='mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
        <h3 className='text-lg font-semibold tracking-tight'>
          Lançamentos Recentes
        </h3>
        <p className='text-muted-foreground text-xs italic'>
          * Valores negativos (-) indicam débitos/cobranças.
        </p>
      </div>

      <StatementTable entries={data.entries} />
    </div>
  );
}
