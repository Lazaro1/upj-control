import PageContainer from '@/components/layout/page-container';
import { CashTransactionForm } from '@/features/cash-transactions/components/cash-transaction-form';
import { assertFinancialWritePage } from '@/lib/auth/roles.server';

export const metadata = {
  title: 'Dashboard: Novo Lançamento de Caixa'
};

export default async function NewCashTransactionPage() {
  await assertFinancialWritePage();

  return (
    <PageContainer scrollable={true}>
      <CashTransactionForm />
    </PageContainer>
  );
}
