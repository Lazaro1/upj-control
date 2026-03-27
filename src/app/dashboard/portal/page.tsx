import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { getPortalOverview, getMemberByClerkId } from '@/features/member-portal/server/portal.queries';
import { PortalOverview } from '@/features/member-portal/components/portal-overview';
import { Heading } from '@/components/ui/heading';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';

export const metadata = {
  title: 'Meu Portal — UPJ Control'
};

export default async function PortalPage() {
  const member = await getMemberByClerkId();

  if (!member) {
    return (
      <PageContainer scrollable={false}>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
          <IconAlertTriangle className="h-10 w-10 text-muted-foreground" />
          <Heading title="Acesso Restrito" description="Sua conta não está vinculada a um membro ativo nesta loja." />
        </div>
      </PageContainer>
    );
  }

  const { data, success, error } = await getPortalOverview();

  if (!success || !data) {
    return (
      <PageContainer scrollable={false}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Heading title="Erro ao carregar portal" description={error || "Erro desconhecido"} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      scrollable={true}
      pageTitle={`Bem-vindo, ${member.fullName.split(' ')[0]}`}
      pageDescription="Acompanhe sua situação financeira junto à Loja."
    >
      <Suspense fallback={<div className="flex justify-center p-8"><IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <PortalOverview data={data} memberId={member.id} />
      </Suspense>
    </PageContainer>
  );
}
