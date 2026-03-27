import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { getPortalTransactions } from '@/features/member-portal/server/portal.queries';
import { TransactionsTable } from '@/features/member-portal/components/portal-transactions-tables/index';
import { Heading } from '@/components/ui/heading';
import { IconLoader2 } from '@tabler/icons-react';

export const metadata = {
  title: 'Lançamentos — Meu Portal'
};

export default async function PortalTransactionsPage(
  props: { searchParams: Promise<Record<string, string | string[] | undefined>> }
) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit, 10) : 10;

  const { data, success } = await getPortalTransactions({ page, limit });

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Heading
          title="Meus Lançamentos"
          description="Histórico completo de cobranças e pagamentos vinculados a você."
        />
        <Suspense fallback={<div className="flex justify-center p-8"><IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
          {success && data ? (
            <TransactionsTable data={data.items as any} totalItems={data.total} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">Erro ao carregar lançamentos.</div>
          )}
        </Suspense>
      </div>
    </PageContainer>
  );
}
