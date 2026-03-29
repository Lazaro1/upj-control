import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { searchParamsCache, type SearchParams } from '@/lib/searchparams';
import { CashTransactionListing } from '@/features/cash-transactions/components/cash-transaction-listing';
import { CashSummaryCards } from '@/features/cash-transactions/components/cash-summary-cards';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { resolveDashboardLanding } from '@/lib/auth/landing';

export const metadata = {
  title: 'Dashboard: Caixa Geral'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CashTransactionsPage(props: PageProps) {
  const { userId, orgId, orgRole } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');
  if (orgRole === 'org:member') {
    const landing = await resolveDashboardLanding({ userId, orgRole });
    redirect(landing);
  }

  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const dateFrom = searchParamsCache.get('dateFrom') || undefined;
  const dateTo = searchParamsCache.get('dateTo') || undefined;

  return (
    <PageContainer
      scrollable={true}
      pageTitle='Caixa Geral'
      pageDescription='Registre entradas e saídas financeiras da loja.'
      pageHeaderAction={
        <Link href='/dashboard/cash-transactions/new' className={cn(buttonVariants())}>
          <IconPlus className='mr-2 h-4 w-4' /> Novo Lançamento
        </Link>
      }
    >
      <CashSummaryCards dateFrom={dateFrom} dateTo={dateTo} />
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <CashTransactionListing />
      </Suspense>
    </PageContainer>
  );
}
