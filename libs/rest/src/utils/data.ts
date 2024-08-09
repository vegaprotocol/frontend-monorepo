import compact from 'lodash/compact';

type Edges<T> = Array<{ node?: T } | null>;

export function removePaginationWrapper<T>(
  edges: Edges<T> | undefined | null
): T[] {
  return compact(edges?.map((edge) => edge?.node));
}
