import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { searchParamsCache, type SearchParams } from '@/lib/searchparams';
import { PaymentListing } from '@/features/payments/components/payment-listing';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Pagamentos e Baixas'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PaymentsPage(props: PageProps) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Pagamentos'
      pageDescription='Registre recebimentos e dê baixa em cobranças pendentes.'
      pageHeaderAction={
        <Link href='/dashboard/payments/new' className={cn(buttonVariants())}>
          <IconPlus className='mr-2 h-4 w-4' /> Nova Baixa
        </Link>
      }
    >
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}>
        <PaymentListing />
      </Suspense>
    </PageContainer>
  );
}
