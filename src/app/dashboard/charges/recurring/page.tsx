import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { RecurringChargesPage } from '@/features/charges/components/recurring-charges-page';
import { assertFinancialWritePage } from '@/lib/auth/roles.server';

export const metadata = {
  title: 'Lançamento Mensal | UPJ Control'
};

export default async function Page() {
  await assertFinancialWritePage();

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <RecurringChargesPage />
      </div>
    </PageContainer>
  );
}
