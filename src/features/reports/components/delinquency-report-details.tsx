import { Badge } from '@/components/ui/badge';

interface DelinquencyDetailRow {
  chargeId: string;
  chargeTypeName: string;
  dueDate: string;
  openAmount: number;
  daysOverdue: number;
}

interface DelinquencyReportDetailsProps {
  details: DelinquencyDetailRow[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC'
});

export function DelinquencyReportDetails({
  details
}: DelinquencyReportDetailsProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50'>
          <tr>
            <th className='px-3 py-2 text-left font-medium'>
              Tipo de cobranca
            </th>
            <th className='px-3 py-2 text-left font-medium'>Vencimento</th>
            <th className='px-3 py-2 text-right font-medium'>Dias em atraso</th>
            <th className='px-3 py-2 text-right font-medium'>
              Valor em aberto
            </th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail) => (
            <tr key={detail.chargeId} className='border-t'>
              <td className='px-3 py-2'>{detail.chargeTypeName}</td>
              <td className='px-3 py-2'>
                {dateFormatter.format(new Date(detail.dueDate))}
              </td>
              <td className='px-3 py-2 text-right'>
                <Badge variant='outline'>{detail.daysOverdue} dias</Badge>
              </td>
              <td className='px-3 py-2 text-right'>
                {currencyFormatter.format(detail.openAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
