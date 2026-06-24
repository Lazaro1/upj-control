import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { resolveDashboardLanding } from '@/lib/auth/landing';
import { PeriodClosingPage } from '@/features/period-closing/components/period-closing-page';
import { listPeriodClosings } from '@/features/period-closing/server/period-closing.actions';

export const metadata = {
  title: 'Dashboard: Fechamento Mensal'
};

export default async function PeriodClosingRoutePage() {
  const { userId, orgId, orgRole } = await auth();
  if (!orgId) redirect('/auth/sign-in');
  if (orgRole === 'org:member') {
    const landing = await resolveDashboardLanding({ userId, orgRole });
    redirect(landing);
  }

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
