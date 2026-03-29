import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemberFinancialPosition {
  memberId: string;
  memberName: string;
  totalCharged: number;
  totalPaid: number;
  balance: number;
}

interface MemberPositionTableProps {
  data: MemberFinancialPosition[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function MemberPositionTable({ data }: MemberPositionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posição Financeira dos Membros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='px-4 py-2 text-left font-medium'>Membro</th>
                <th className='px-4 py-2 text-right font-medium'>
                  Total Cobrado
                </th>
                <th className='px-4 py-2 text-right font-medium'>Total Pago</th>
                <th className='px-4 py-2 text-right font-medium'>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((member) => (
                <tr key={member.memberId} className='border-t'>
                  <td className='px-4 py-2'>{member.memberName}</td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(member.totalCharged)}
                  </td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(member.totalPaid)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      member.balance > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {currencyFormatter.format(member.balance)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr className='border-t'>
                  <td
                    colSpan={4}
                    className='text-muted-foreground px-4 py-6 text-center'
                  >
                    Nenhum membro ativo encontrado para o período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
