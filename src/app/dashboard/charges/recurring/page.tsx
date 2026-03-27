import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { RecurringChargesPage } from '@/features/charges/components/recurring-charges-page';

export const metadata = {
  title: 'Lançamento Mensal | UPJ Control'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <RecurringChargesPage />
      </div>
    </PageContainer>
  );
}
