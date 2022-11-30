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

export const removeNodeFromEdges = (
  edges: Array<{ node: any } | null>
): any[] => {
  return compact(edges.map((edge) => edge?.node));
};
