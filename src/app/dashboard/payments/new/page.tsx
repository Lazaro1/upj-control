import PageContainer from '@/components/layout/page-container';
import { PaymentForm } from '@/features/payments/components/payment-form';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Registrar Novo Pagamento'
};

export default async function NewPaymentPage() {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  // Load ONLY members who have at least one pending or partially paid charge
  const membersWithDebts = await prisma.member.findMany({
    where: {
      charges: {
        some: { status: { in: ['pendente', 'parcialmente_paga'] } }
      }
    },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' }
  });

  return (
    <PageContainer scrollable={true}>
      <PaymentForm members={membersWithDebts} />
    </PageContainer>
  );
}
