import { searchParamsCache } from '@/lib/searchparams';
import { ChargesTable } from './charge-tables';
import { getCharges } from '../server/charge.actions';

export async function ChargeListing() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name'); // We can map name/fullName to search
  const pageLimit = searchParamsCache.get('perPage');
  const status = searchParamsCache.get('status');
  const memberId = searchParamsCache.get('memberId');
  const chargeTypeId = searchParamsCache.get('chargeTypeId');
  const dueDate = searchParamsCache.get('dueDate');

  // getCharges handles resolving all records from Prisma Server Actions
  const result = await getCharges(
    page || undefined,
    pageLimit || undefined,
    search || undefined,
    status || undefined,
    memberId || undefined,
    chargeTypeId || undefined,
    dueDate || undefined
  );

  const data = result.success && result.data ? result.data : [];
  const totalItems = result.success && result.total ? result.total : 0;

  return <ChargesTable data={data} totalItems={totalItems} />;
}
