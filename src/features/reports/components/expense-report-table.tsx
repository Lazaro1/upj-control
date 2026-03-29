import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseItem {
  category: string;
  total: number;
}

interface ExpenseReportData {
  expenses: ExpenseItem[];
  grandTotal: number;
}

interface ExpenseReportTableProps {
  data: ExpenseReportData;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function ExpenseReportTable({ data }: ExpenseReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Saídas</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='px-4 py-2 text-left font-medium'>Categoria</th>
                <th className='px-4 py-2 text-right font-medium'>Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense) => (
                <tr key={expense.category} className='border-t'>
                  <td className='px-4 py-2'>{expense.category}</td>
                  <td className='px-4 py-2 text-right'>
                    {currencyFormatter.format(expense.total)}
                  </td>
                </tr>
              ))}
              {data.expenses.length === 0 && (
                <tr className='border-t'>
                  <td
                    colSpan={2}
                    className='text-muted-foreground px-4 py-6 text-center'
                  >
                    Nenhuma saída encontrada no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
