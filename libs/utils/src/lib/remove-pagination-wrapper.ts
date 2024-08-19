import compact from 'lodash/compact';

/**
 * A simple function that removes the 'node' level from API responses, i.e.
 *
 * [
 *  { node: { id: '1', name: 'foo' } },
 *  { node: { id: '2', name: 'bar' } },
 * ]
 *
 *  becomes:
 *
 * [
 *  { id: '1', name: 'foo' },
 *  { id: '2', name: 'bar' },
 * ]
 *
 * It also removes any null values.
 *
 * @param edges array
 * @returns array
 */

export function removePaginationWrapper<T>(
  edges: Array<{ node?: T } | null> | undefined | null
): T[] {
  return compact(edges?.map((edge) => edge?.node));
}
