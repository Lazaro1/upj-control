import PageContainer from '@/components/layout/page-container';
import { StatementView } from '@/features/statements/components/statement-view';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Extrato do Irmão'
};

export default async function MemberStatementPage({
  params
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  const { memberId } = await params;

  return (
    <PageContainer scrollable={true}>
      <div className='min-w-0'>
        <StatementView memberId={memberId} />
      </div>
    </PageContainer>
  );
}
