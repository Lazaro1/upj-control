import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { getPortalOverview, getMemberByClerkId } from '@/features/member-portal/server/portal.queries';
import { PortalOverview } from '@/features/member-portal/components/portal-overview';
import { PortalPageActions } from '@/features/member-portal/components/portal-page-actions';
import { Heading } from '@/components/ui/heading';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';

export const metadata = {
  title: 'Meu Portal — UPJ Control'
};

export const dynamic = 'force-dynamic';

function buildPageDescription(fullName: string, phone?: string | null): string {
  if (phone) {
    return `${fullName} • ${phone}`;
  }
  return fullName;
}

export default async function PortalPage() {
  const member = await getMemberByClerkId();

  if (!member) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex h-[50vh] flex-col items-center justify-center space-y-4 text-center'>
          <IconAlertTriangle className='h-10 w-10 text-muted-foreground' />
          <Heading
            title='Acesso Restrito'
            description='Sua conta não está vinculada a um membro ativo nesta loja.'
          />
        </div>
      </PageContainer>
    );
  }

  const { data, success, error } = await getPortalOverview();

  if (!success || !data) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <Heading
            title='Erro ao carregar portal'
            description={error || 'Erro desconhecido'}
          />
        </div>
      </PageContainer>
    );
  }

  const firstName = member.fullName.split(' ')[0];

  return (
    <PageContainer
      scrollable={false}
      pageTitle={`Bem-vindo, ${firstName}`}
      pageDescription={buildPageDescription(member.fullName, member.phone)}
      pageHeaderAction={<PortalPageActions memberId={member.id} />}
    >
      <Suspense
        fallback={
          <div className='flex justify-center p-8'>
            <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        }
      >
        <PortalOverview data={data} />
      </Suspense>
    </PageContainer>
  );
}
