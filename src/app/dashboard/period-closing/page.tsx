import PageContainer from '@/components/layout/page-container';
import { assertFinancialWritePage } from '@/lib/auth/roles';
import { PeriodClosingPage } from '@/features/period-closing/components/period-closing-page';
import { listPeriodClosings } from '@/features/period-closing/server/period-closing.actions';

export const metadata = {
  title: 'Dashboard: Fechamento Mensal'
};

export default async function PeriodClosingRoutePage() {
  const { orgRole } = await assertFinancialWritePage();

  const result = await listPeriodClosings(1, 10);

  const initialClosings = result.success && result.data ? result.data : [];
  const initialPagination = result.success
    ? {
        page: 1,
        perPage: 10,
        total: result.total ?? 0,
        pageCount: result.pageCount ?? 1
      }
    : { page: 1, perPage: 10, total: 0, pageCount: 1 };

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Fechamento Mensal'
      pageDescription='Encerre períodos financeiros para impedir alterações nos dados.'
    >
      <PeriodClosingPage
        initialClosings={initialClosings}
        initialPagination={initialPagination}
        orgRole={orgRole}
      />
    </PageContainer>
  );
}
