import PageContainer from '@/components/layout/page-container';
import { CashTransactionForm } from '@/features/cash-transactions/components/cash-transaction-form';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { resolveDashboardLanding } from '@/lib/auth/landing';

export const metadata = {
  title: 'Dashboard: Novo Lançamento de Caixa'
};

export default async function NewCashTransactionPage() {
  const { userId, orgId, orgRole } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');
  if (orgRole === 'org:member') {
    const landing = await resolveDashboardLanding({ userId, orgRole });
    redirect(landing);
  }

  return (
    <PageContainer scrollable={true}>
      <CashTransactionForm />
    </PageContainer>
  );
}
