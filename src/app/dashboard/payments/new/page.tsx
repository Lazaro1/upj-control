import PageContainer from '@/components/layout/page-container';
import { PaymentForm } from '@/features/payments/components/payment-form';
import { prisma } from '@/lib/db';
import { assertFinancialWritePage } from '@/lib/auth/roles.server';

export const metadata = {
  title: 'Dashboard: Registrar Novo Pagamento'
};

export default async function NewPaymentPage() {
  await assertFinancialWritePage();

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
