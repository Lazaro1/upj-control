import PageContainer from '@/components/layout/page-container';
import { ChargeTypeForm } from '@/features/charge-types/components/charge-type-form';
import { assertFinancialWritePage } from '@/lib/auth/roles.server';

export const metadata = {
  title: 'Dashboard: Novo Tipo de Cobrança'
};

export default async function NewChargeTypePage() {
  await assertFinancialWritePage();

  return (
    <PageContainer scrollable>
      <ChargeTypeForm />
    </PageContainer>
  );
}
