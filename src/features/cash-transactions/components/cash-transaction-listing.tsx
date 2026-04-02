import { searchParamsCache } from '@/lib/searchparams';
import { CashTransactionsTable } from './cash-transaction-tables';
import { getCashTransactions } from '../server/cash-transaction.actions';

export async function CashTransactionListing() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name'); // map search to name parameter
  const pageLimit = searchParamsCache.get('perPage');
  const type = searchParamsCache.get('type');
  const category = searchParamsCache.get('category');
  const dateFrom = searchParamsCache.get('dateFrom');
  const dateTo = searchParamsCache.get('dateTo');
  const sort = searchParamsCache.get('sort');

  const result = await getCashTransactions(
    page || 1,
    pageLimit || 10,
    search || undefined,
    type || undefined,
    category || undefined,
    dateFrom || undefined,
    dateTo || undefined,
    sort || undefined
  );

  const data = result.success && result.data ? result.data : [];
  const totalItems = result.success && result.total ? result.total : 0;

  return <CashTransactionsTable data={data} totalItems={totalItems} />;
}
