import { useCallback, useEffect, useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import type { Orders, OrdersVariables } from './__generated__/Orders';
import type { OrderSub, OrderSubVariables } from './__generated__/OrderSub';
import type { OrderFields } from './__generated__/OrderFields';

const ORDER_FRAGMENT = gql`
  fragment OrderFields on Order {
    id
    market {
      id
      name
      decimalPlaces
      tradableInstrument {
        instrument {
          code
        }
      }
    }
    type
    side
    size
    status
    rejectionReason
    price
    timeInForce
    remaining
    expiresAt
    createdAt
    updatedAt
  }
`;

export const ORDERS_QUERY = gql`
  ${ORDER_FRAGMENT}
  query Orders($partyId: ID!) {
    party(id: $partyId) {
      id
      orders {
        ...OrderFields
      }
    }
  }
`;

export const ORDERS_SUB = gql`
  ${ORDER_FRAGMENT}
  subscription OrderSub($partyId: ID!) {
    orders(partyId: $partyId) {
      ...OrderFields
    }
  }
`;

interface UseOrders {
  orders: OrderFields[];
  error: Error | null;
  loading: boolean;
}

export const useOrders = (partyId: string): UseOrders => {
  const client = useApolloClient();
  const [orders, setOrders] = useState<OrderFields[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const mergeOrders = useCallback((update: OrderFields[]) => {
    // A subscription payload can contain multiple updates for a single order so we need to first
    // sort them by updatedAt (or createdAt if the order hasn't been updated) with the newest first,
    // then use uniqBy, which selects the first occuring order for an id to ensure we only get the latest order
    setOrders((curr) => {
      const sorted = orderBy(
        [...curr, ...update],
        (o) => {
          if (!o.updatedAt) return new Date(o.createdAt).getTime();
          return new Date(o.updatedAt).getTime();
        },
        'desc'
      );
      return uniqBy(sorted, 'id');
    });
  }, []);

  // Make initial fetch
  useEffect(() => {
    const fetchOrders = async () => {
      if (!partyId) return;

      setLoading(true);

      try {
        const res = await client.query<Orders, OrdersVariables>({
          query: ORDERS_QUERY,
          variables: { partyId },
        });

        if (!res.data.party?.orders?.length) return;

        mergeOrders(res.data.party.orders);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Something went wrong')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mergeOrders, partyId, client]);

  // Start subscription
  useEffect(() => {
    if (!partyId) return;

    const sub = client
      .subscribe<OrderSub, OrderSubVariables>({
        query: ORDERS_SUB,
        variables: { partyId },
      })
      .subscribe(({ data }) => {
        if (!data?.orders) {
          return;
        }
        mergeOrders(data.orders);
      });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [client, partyId, mergeOrders]);

  return { orders, error, loading };
};
