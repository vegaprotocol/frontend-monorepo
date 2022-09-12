import type { Schema } from '@vegaprotocol/types';

type Node<T> = {
  [key: string]: any;
  node: T;
};

type Connection<A> = {
  [key: string]: any;
  edges?: Schema.Maybe<Array<Schema.Maybe<A>>>;
};

export function getNodes<
  T,
  A extends Node<T> = Node<T>,
  B extends Connection<A> = Connection<A>
>(data?: B | null, filterBy?: (item: T | null) => boolean): T[] {
  return (
    data?.edges
      ?.filter((e) => e && e?.node && (filterBy ? filterBy(e.node) : e.node))
      .map((e) => (e as Node<T>).node as T) || []
  );
}
