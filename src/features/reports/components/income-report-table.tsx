import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncomeEntry {
  source: string;
  total: number;
}

interface IncomeReportData {
  paymentEntries: IncomeEntry[];
  cashEntries: IncomeEntry[];
  grandTotal: number;
}

interface IncomeReportTableProps {
  data: IncomeReportData;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function IncomeReportTable({ data }: IncomeReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Entradas</CardTitle>
      </CardHeader>
      <CardContent className='space-y-8'>
        <section className='space-y-3'>
          <h3 className='text-base font-semibold'>Recebimentos (Pagamentos)</h3>
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-4 py-2 text-left font-medium'>
                    Método de Pagamento
                  </th>
                  <th className='px-4 py-2 text-right font-medium'>
                    Total (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.paymentEntries.map((entry) => (
                  <tr key={`${entry.source}-payment`} className='border-t'>
                    <td className='px-4 py-2'>{entry.source}</td>
                    <td className='px-4 py-2 text-right'>
                      {currencyFormatter.format(entry.total)}
                    </td>
                  </tr>
                ))}
                {data.paymentEntries.length === 0 && (
                  <tr className='border-t'>
                    <td
                      colSpan={2}
                      className='text-muted-foreground px-4 py-6 text-center'
                    >
                      Nenhum recebimento encontrado no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className='space-y-3'>
          <h3 className='text-base font-semibold'>Entradas Avulsas (Caixa)</h3>
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-4 py-2 text-left font-medium'>Categoria</th>
                  <th className='px-4 py-2 text-right font-medium'>
                    Total (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.cashEntries.map((entry) => (
                  <tr key={`${entry.source}-cash`} className='border-t'>
                    <td className='px-4 py-2'>{entry.source}</td>
                    <td className='px-4 py-2 text-right'>
                      {currencyFormatter.format(entry.total)}
                    </td>
                  </tr>
                ))}
                {data.cashEntries.length === 0 && (
                  <tr className='border-t'>
                    <td
                      colSpan={2}
                      className='text-muted-foreground px-4 py-6 text-center'
                    >
                      Nenhuma entrada avulsa encontrada no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className='bg-muted/40 flex items-center justify-between rounded-md border px-4 py-3'>
          <span className='text-sm font-medium'>Total Geral</span>
          <span className='text-lg font-semibold'>
            {currencyFormatter.format(data.grandTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
