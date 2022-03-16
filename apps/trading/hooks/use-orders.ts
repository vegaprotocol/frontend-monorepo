import {
  gql,
  useApolloClient,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import {
  Orders,
  OrdersVariables,
  Orders_party_orders,
} from './__generated__/Orders';
import { OrderSub, OrderSubVariables } from './__generated__/OrderSub';
import { singletonHook } from 'react-singleton-hook';
import uniqBy from 'lodash.uniqby';
import orderBy from 'lodash.orderby';
import { useVegaWallet } from '@vegaprotocol/wallet';

const ORDER_FRAGMENT = gql`
  fragment OrderFields on Order {
    id
    market {
      id
      name
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
    price
    timeInForce
    remaining
    createdAt
    updatedAt
  }
`;

const ORDERS_QUERY = gql`
  ${ORDER_FRAGMENT}
  query Orders($partyId: ID!) {
    party(id: $partyId) {
      orders {
        ...OrderFields
      }
    }
  }
`;

const ORDERS_SUB = gql`
  ${ORDER_FRAGMENT}
  subscription OrderSub($partyId: ID!) {
    orders(partyId: $partyId) {
      ...OrderFields
    }
  }
`;

export const useOrdersImpl = () => {
  const { keypair } = useVegaWallet();
  const [orders, setOrders] = useState<Orders_party_orders[]>([]);
  const client = useApolloClient();

  const mergeOrders = useCallback((update: Orders_party_orders[]) => {
    setOrders((curr) => {
      console.log('curr', curr);
      console.log('update', update);

      const sorted = orderBy(
        [...curr, ...update],
        (o) => {
          if (!o.updatedAt) return new Date(o.createdAt).getTime();
          return new Date(o.updatedAt).getTime();
        },
        'desc'
      );
      const uniq = uniqBy(sorted, 'id');
      return uniq;
    });
  }, []);

  // Make initial fetch
  useEffect(() => {
    const fetchOrders = async () => {
      if (!keypair?.pub) return;

      try {
        const res = await client.query<Orders, OrderSubVariables>({
          query: ORDERS_QUERY,
          variables: { partyId: keypair.pub },
        });

        if (!res.data.party?.orders.length) return;

        mergeOrders(res.data.party.orders);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, [mergeOrders, keypair, client]);

  // Start subscription
  useEffect(() => {
    if (!keypair?.pub) return;

    const sub = client
      .subscribe<OrderSub, OrderSubVariables>({
        query: ORDERS_SUB,
        variables: { partyId: keypair.pub },
      })
      .subscribe(({ data }) => {
        console.log('new data', data);
        mergeOrders(data.orders);
      });

    return () => {
      if (sub) {
        console.log('unsubscribing');
        sub.unsubscribe();
      }
    };
  }, [client, keypair, mergeOrders]);

  return { orders };
};

const initial = {
  orders: [],
};

export const useOrders = singletonHook(initial, useOrdersImpl);
