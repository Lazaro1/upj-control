import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MemberForm } from '@/features/members/components/member-form';
import { getMemberById } from '@/features/members/server/member.actions';

export const metadata = {
  title: 'Editar Membro — UPJ Control'
};

type EditMemberPageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { memberId } = await params;
  const member = await getMemberById(memberId);

  if (!member) {
    notFound();
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <Breadcrumbs />
      <MemberForm initialData={member} />
    </div>
  );
}
