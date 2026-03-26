import PageContainer from '@/components/layout/page-container';
import { ChargeForm } from '@/features/charges/components/charge-form';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Nova Cobrança'
};

export default async function NewChargePage() {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  // Load members and charge types to populate the form
  const [members, chargeTypes] = await Promise.all([
    prisma.member.findMany({
      where: { status: 'ativo' }, // Só membro ativo recebe cobrança nova normalmente (regra de negócios padrão)
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' }
    }),
    prisma.chargeType.findMany({
      where: { active: true },
      select: { id: true, name: true, defaultAmount: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const formattedChargeTypes = chargeTypes.map(c => ({
    ...c,
    defaultAmount: c.defaultAmount ? Number(c.defaultAmount) : null
  }));

  return (
    <PageContainer scrollable={true}>
      <ChargeForm members={members} chargeTypes={formattedChargeTypes} />
    </PageContainer>
  );
}
