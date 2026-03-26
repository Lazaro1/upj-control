import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  fullName: parseAsString,
  email: parseAsString,
  phone: parseAsString,
  status: parseAsString,
  memberId: parseAsString,
  chargeTypeId: parseAsString,
  dueDate: parseAsString,
  paymentMethod: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);

export type SearchParams = Record<string, string | string[] | undefined>;

