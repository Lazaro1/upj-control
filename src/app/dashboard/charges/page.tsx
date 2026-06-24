import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { searchParamsCache, type SearchParams } from '@/lib/searchparams';
import { ChargeListing } from '@/features/charges/components/charge-listing';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { assertFinancialWritePage } from '@/lib/auth/roles.server';

export const metadata = {
  title: 'Dashboard: Cobranças'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ChargesPage(props: PageProps) {
  await assertFinancialWritePage();

  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Cobranças Manuais'
      pageDescription='Gere e gerencie recebimentos pendentes da sua loja.'
      pageHeaderAction={
        <Link
          href='/dashboard/charges/new'
          className={cn(buttonVariants(), 'w-full justify-center sm:w-auto')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Nova Cobrança
        </Link>
      }
    >
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
        <ChargeListing />
      </Suspense>
    </PageContainer>
  );
}
