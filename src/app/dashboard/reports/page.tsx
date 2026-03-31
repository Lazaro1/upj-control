import { auth } from '@clerk/nextjs/server';
import { forbidden, redirect } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { ReportsPage } from '@/features/reports/components/reports-page';

export const metadata = {
  title: 'Dashboard: Relatórios'
};

export default async function ReportsRoutePage() {
  const { orgId, orgRole } = await auth();

  if (!orgId) {
    redirect('/dashboard/workspaces');
  }

  if (orgRole === 'org:member') {
    forbidden();
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
