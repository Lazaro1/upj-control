import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { resolveDashboardLanding } from '@/lib/auth/landing';
import { ReportsPage } from '@/features/reports/components/reports-page';

export const metadata = {
  title: 'Dashboard: Relatórios'
};

export default async function ReportsRoutePage() {
  const { userId, orgId, orgRole } = await auth();

  if (!orgId) {
    redirect('/dashboard/workspaces');
  }

  if (orgRole === 'org:member') {
    const landing = await resolveDashboardLanding({ userId, orgRole });
    redirect(landing);
  }

  return (
    <PageContainer
      scrollable={true}
      pageTitle='Relatórios Financeiros'
      pageDescription='Visualize relatórios consolidados de entradas, saídas e posição financeira.'
    >
      <ReportsPage />
    </PageContainer>
  );
}
