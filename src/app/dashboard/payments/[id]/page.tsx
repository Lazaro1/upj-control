import PageContainer from '@/components/layout/page-container';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { auth } from '@clerk/nextjs/server';
import { ReversePaymentButton } from '@/features/payments/components/reverse-payment-button';

export default async function PaymentReceiptPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      member: true,
      paymentAllocations: {
        include: { charge: { include: { chargeType: true } } }
      }
    }
  });

  if (!payment) notFound();

  return (
    <PageContainer scrollable>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-6 flex items-center justify-between'>
          <Button
            asChild
            variant='ghost'
            className='text-muted-foreground hover:text-foreground'
          >
            <Link href='/dashboard/payments'>
              <IconArrowLeft className='mr-2 h-4 w-4' /> Voltar
            </Link>
          </Button>
          <div className='flex items-center gap-2'>
            <Button variant='outline'>
              <IconPrinter className='mr-2 h-4 w-4' /> Imprimir Recibo
            </Button>
            <ReversePaymentButton paymentId={payment.id} />
          </div>
        </div>

        <Card className='border-border/40 bg-card/60 shadow-lg backdrop-blur-xl'>
          <CardHeader className='border-border/40 border-b pb-8 text-center'>
            <CardTitle className='text-3xl font-bold tracking-tight'>
              Recibo de Pagamento
            </CardTitle>
            <CardDescription className='mt-2 text-lg font-medium'>
              Transação #{payment.id.slice(0, 8).toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-8 px-10 pt-8'>
            <div className='grid grid-cols-2 gap-8'>
              <div>
                <p className='text-muted-foreground mb-1 text-sm font-semibold tracking-wider uppercase'>
                  Pagador
                </p>
                <p className='text-xl font-bold'>{payment.member.fullName}</p>
                <p className='text-muted-foreground'>{payment.member.email}</p>
              </div>
              <div className='text-right'>
                <p className='text-muted-foreground mb-1 text-sm font-semibold tracking-wider uppercase'>
                  Detalhes
                </p>
                <p className='text-sm font-medium'>
                  Data:{' '}
                  {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                </p>
                <p className='text-sm font-medium capitalize'>
                  Método: {payment.paymentMethod || 'Outros'}
                </p>
              </div>
            </div>

            <div>
              <p className='text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase'>
                Itens Baixados (Alocações)
              </p>
              <div className='border-border/50 overflow-hidden rounded-lg border'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-muted/50 border-border/50 border-b font-medium'>
                    <tr>
                      <th className='px-4 py-3'>Cobrança</th>
                      <th className='px-4 py-3 text-right'>Mês Ref.</th>
                      <th className='px-4 py-3 text-right'>Valor Alocado</th>
                    </tr>
                  </thead>
                  <tbody className='divide-border/30 divide-y'>
                    {payment.paymentAllocations.map((alloc) => (
                      <tr key={alloc.id} className='bg-background/30'>
                        <td className='px-4 py-3 font-medium'>
                          {alloc.charge.chargeType.name}
                        </td>
                        <td className='text-muted-foreground px-4 py-3 text-right'>
                          {new Date(
                            alloc.charge.competenceDate
                          ).toLocaleDateString('pt-BR', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className='px-4 py-3 text-right font-semibold'>
                          R${' '}
                          {Number(alloc.allocatedAmount).toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='bg-primary/5 border-border/50 border-t font-bold'>
                    <tr>
                      <td colSpan={2} className='px-4 py-4 text-right'>
                        Total Recebido
                      </td>
                      <td className='text-primary px-4 py-4 text-right text-lg'>
                        R${' '}
                        {Number(payment.amount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
