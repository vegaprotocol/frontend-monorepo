import type * as Schema from '@vegaprotocol/types';

export type NodeEdge<T> = {
  node: T;
};

export type NodeConnection<A> = {
  edges?: Schema.Maybe<Array<Schema.Maybe<A>>>;
};

export function getNodes<
  T,
  A extends NodeEdge<T> = NodeEdge<T>,
  B extends NodeConnection<A> = NodeConnection<A>
>(data?: B | null, filterBy?: (item?: T | null) => boolean) {
  const edges = data?.edges || [];
  return edges.reduce<T[]>((acc, edge) => {
    if (edge?.node && (filterBy ? filterBy(edge?.node) : true)) {
      acc.push(edge.node);
    }
    return acc;
  }, []);
}
