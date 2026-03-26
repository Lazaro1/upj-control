import PageContainer from '@/components/layout/page-container';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { auth } from '@clerk/nextjs/server';

export default async function PaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth();
  if (!orgId) redirect('/dashboard/workspaces');

  const { id } = await params;
  
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      member: true,
      paymentAllocations: { include: { charge: { include: { chargeType: true } } } }
    }
  });

  if (!payment) notFound();

  return (
    <PageContainer scrollable>
       <div className='max-w-3xl mx-auto'>
         <div className='mb-6 flex items-center justify-between'>
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/payments">
                <IconArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Link>
            </Button>
            <Button variant="outline">
              <IconPrinter className="mr-2 h-4 w-4" /> Imprimir Recibo
            </Button>
         </div>

         <Card className='border-border/40 shadow-lg bg-card/60 backdrop-blur-xl'>
           <CardHeader className="text-center pb-8 border-b border-border/40">
             <CardTitle className="text-3xl font-bold tracking-tight">Recibo de Pagamento</CardTitle>
             <CardDescription className="text-lg mt-2 font-medium">Transação #{payment.id.slice(0, 8).toUpperCase()}</CardDescription>
           </CardHeader>
           <CardContent className="space-y-8 pt-8 px-10">
              
              <div className="grid grid-cols-2 gap-8">
                 <div>
                   <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pagador</p>
                   <p className="text-xl font-bold">{payment.member.fullName}</p>
                   <p className="text-muted-foreground">{payment.member.email}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Detalhes</p>
                   <p className="text-sm font-medium">Data: {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</p>
                   <p className="text-sm font-medium capitalize">Método: {payment.paymentMethod || 'Outros'}</p>
                 </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Itens Baixados (Alocações)</p>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3">Cobrança</th>
                        <th className="px-4 py-3 text-right">Mês Ref.</th>
                        <th className="px-4 py-3 text-right">Valor Alocado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {payment.paymentAllocations.map(alloc => (
                        <tr key={alloc.id} className="bg-background/30">
                          <td className="px-4 py-3 font-medium">{alloc.charge.chargeType.name}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {new Date(alloc.charge.competenceDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            R$ {Number(alloc.allocatedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-primary/5 font-bold border-t border-border/50">
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-right">Total Recebido</td>
                        <td className="px-4 py-4 text-right text-lg text-primary">
                          R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
