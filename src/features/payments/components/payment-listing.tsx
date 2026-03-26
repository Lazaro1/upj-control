import { searchParamsCache } from '@/lib/searchparams';
import { PaymentsTable } from './payment-tables';
import { getPayments } from '../server/payment.actions';

export async function PaymentListing() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name'); // map to global search if standard
  const pageLimit = searchParamsCache.get('perPage');
  const memberId = searchParamsCache.get('memberId');
  const paymentMethod = searchParamsCache.get('paymentMethod');

  const result = await getPayments(
    page || undefined,
    pageLimit || undefined,
    search || undefined,
    memberId || undefined,
    paymentMethod || undefined
  );

  const data = result.success && result.data ? result.data : [];
  const totalItems = result.success && result.total ? result.total : 0;

  return <PaymentsTable data={data} totalItems={totalItems} />;
}
