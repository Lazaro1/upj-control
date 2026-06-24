import { searchParamsCache } from '@/lib/searchparams';
import { getMembers } from '@/features/members/server/member.actions';
import { MemberListing } from '@/features/members/components/member-listing';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Membros — UPJ Control'
};

type MembersPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParamsCache.parse(searchParams);

  const { members, total, pageCount } = await getMembers({
    page: params.page,
    perPage: params.perPage,
    sort: params.sort ?? undefined,
    fullName: params.fullName ?? undefined,
    email: params.email ?? undefined,
    phone: params.phone ?? undefined,
    status: params.status ?? undefined
  });

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0 flex-1'>
          <Heading
            title='Membros'
            description='Gerencie os irmãos cadastrados na loja.'
          />
        </div>
        <Link href='/dashboard/members/new' className='w-full sm:w-auto'>
          <Button className='w-full sm:w-auto'>
            <IconPlus className='mr-2 h-4 w-4' /> Novo Membro
          </Button>
        </Link>
      </div>
      <Separator />
      <MemberListing data={members} totalItems={total} pageCount={pageCount} />
    </div>
  );
}
