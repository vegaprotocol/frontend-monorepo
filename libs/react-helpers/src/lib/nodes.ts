import type { Schema } from '@vegaprotocol/types';

type Node<T> = {
  [key: string]: unknown;
  node: T;
};

type Connection<A> = {
  [key: string]: unknown;
  edges?: Schema.Maybe<Array<Schema.Maybe<A>>>;
};

export function getNodes<
  T,
  A extends Node<T> = Node<T>,
  B extends Connection<A> = Connection<A>
>(data?: B | null, filterBy?: (item?: T | null) => boolean) {
  const edges = data?.edges || [];
  return edges.reduce<T[]>((acc, edge) => {
    if (edge?.node && (filterBy ? filterBy(edge?.node) : true)) {
      acc.push(edge.node);
    }
    return acc;
  }, []);
};
