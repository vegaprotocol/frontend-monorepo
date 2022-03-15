import { gql, useQuery, useSubscription } from '@apollo/client';
import { Orders, OrdersVariables } from './__generated__/Orders';
import { OrderSub, OrderSubVariables } from './__generated__/OrderSub';

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

export const useOrders = (pubkey?: string) => {
  const { data: queryData } = useQuery<Orders, OrdersVariables>(ORDERS_QUERY, {
    variables: { partyId: pubkey },
    skip: !pubkey,
  });
  const { data: subData } = useSubscription<OrderSub, OrderSubVariables>(
    ORDERS_SUB,
    {
      variables: { partyId: pubkey },
      skip: !pubkey,
    }
  );

  return {
    initial: queryData?.party?.orders || [],
    incoming: subData?.orders || [],
  };
};
