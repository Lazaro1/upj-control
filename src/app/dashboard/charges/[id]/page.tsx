import PageContainer from '@/components/layout/page-container';
import { ChargeForm } from '@/features/charges/components/charge-form';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { getChargeById } from '@/features/charges/server/charge.actions';

export const metadata = {
  title: 'Dashboard: Editar Cobrança'
};

export default async function EditChargePage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  const { id } = await params;
  
  const [chargeRes, members, chargeTypes] = await Promise.all([
    getChargeById(id),
    prisma.member.findMany({
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' }
    }),
    prisma.chargeType.findMany({
      select: { id: true, name: true, defaultAmount: true },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!chargeRes.success || !chargeRes.data) {
    notFound();
  }

  const formattedChargeTypes = chargeTypes.map(c => ({
    ...c,
    defaultAmount: c.defaultAmount ? Number(c.defaultAmount) : null
  }));

  return (
    <PageContainer scrollable={true}>
      <ChargeForm 
        initialData={chargeRes.data} 
        members={members} 
        chargeTypes={formattedChargeTypes} 
      />
    </PageContainer>
  );
}
