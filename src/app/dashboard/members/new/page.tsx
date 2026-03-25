import { Breadcrumbs } from '@/components/breadcrumbs';
import { MemberForm } from '@/features/members/components/member-form';

export const metadata = {
  title: 'Novo Membro — UPJ Control'
};

export default function NewMemberPage() {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <Breadcrumbs />
      <MemberForm />
    </div>
  );
}
