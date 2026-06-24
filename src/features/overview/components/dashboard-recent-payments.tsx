import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface RecentPaymentItem {
  paymentId: string;
  memberName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('pt-BR');

const methodMap: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  deposito: 'Depósito',
  cheque: 'Cheque'
};

function formatPaymentMethod(method: string | null): string {
  if (!method) return '-';
  const lower = method.toLowerCase().replace(/\s+/g, '_');
  return methodMap[lower] || method;
}

export default function DashboardRecentPayments({
  data
}: {
  data: RecentPaymentItem[];
}) {
  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-500/40' />
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold'>
          Últimos Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            Nenhum pagamento recente
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Irmão</TableHead>
                  <TableHead className='text-right'>Valor</TableHead>
                  <TableHead className='text-right'>Data</TableHead>
                  <TableHead className='text-right'>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.paymentId}>
                    <TableCell className='font-medium'>
                      {item.memberName}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatDate(item.paymentDate)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatPaymentMethod(item.paymentMethod)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
