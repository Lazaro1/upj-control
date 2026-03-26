import { searchParamsCache } from '@/lib/searchparams';
import { getChargeTypes } from '@/features/charge-types/server/charge-type.actions';
import { ChargeTypeListing } from '@/features/charge-types/components/charge-type-listing';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Tipos de Cobrança — UPJ Control'
};

type ChargeTypesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ChargeTypesPage(props: ChargeTypesPageProps) {
  const searchParams = await props.searchParams;
  const params = searchParamsCache.parse(searchParams);

  const { chargeTypes, total, pageCount } = await getChargeTypes({
    page: params.page,
    perPage: params.perPage,
    search: params.name ?? undefined,
    active: params.status === 'false' ? false : params.status === 'true' ? true : undefined
  });

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-start justify-between'>
        <Heading
          title={`Tipos de Cobrança (${total})`}
          description='Gerencie as categorias de cobrança da loja (Mensalidades, Taxas, etc).'
        />
        <Link href='/dashboard/charge-types/new'>
          <Button>
            <IconPlus className='mr-2 h-4 w-4' /> Novo Tipo
          </Button>
        </Link>
      </div>
      <Separator />
      <ChargeTypeListing
        data={chargeTypes}
        totalItems={total}
        pageCount={pageCount}
      />
    </div>
  );
}
