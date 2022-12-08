import type * as Schema from '@vegaprotocol/types';

type Edge<T> = {
  node: T;
};

type Connection<A> = {
  edges?: Schema.Maybe<Array<Schema.Maybe<A>>>;
};

export function getNodes<
  T,
  A extends Edge<T> = Edge<T>,
  B extends Connection<A> = Connection<A>
>(data?: B | null, filterBy?: (item?: T | null) => boolean) {
  const edges = data?.edges || [];
  return edges.reduce<T[]>((acc, edge) => {
    if (edge?.node && (filterBy ? filterBy(edge?.node) : true)) {
      acc.push(edge.node);
    }
    return acc;
  }, []);
}
