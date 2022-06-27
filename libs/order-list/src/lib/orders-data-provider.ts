import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { OrderFields } from './__generated__/OrderFields';
import type { Orders, Orders_party_orders } from './__generated__/Orders';
import type { OrderSub } from './__generated__/OrderSub';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

const ORDER_FRAGMENT = gql`
  fragment OrderFields on Order {
    id
    market {
      id
      name
      decimalPlaces
      positionDecimalPlaces
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

// A single update can contain the same order with multiple updates, so we need to find
// the latest version of the order and only update using that
export const sortOrders = (orders: OrderFields[]) => {
  return orderBy(
    orders,
    (o) => {
      if (!o.updatedAt) return new Date(o.createdAt).getTime();
      return new Date(o.updatedAt).getTime();
    },
    'desc'
  );
};

export const uniqOrders = (orders: OrderFields[]) => {
  return uniqBy(orders, 'id');
};

export const prepareIncomingOrders = (delta: OrderFields[]) => {
  const sortedOrders = sortOrders(delta);
  const incoming = uniqOrders(sortedOrders);
  return incoming;
};

const update = (data: OrderFields[], delta: OrderFields[]) =>
  produce(data, (draft) => {
    const incoming = prepareIncomingOrders(delta);

    // Add or update incoming orders
    incoming.forEach((order) => {
      const index = draft.findIndex((o) => o.id === order.id);
      if (index === -1) {
        draft.unshift(order);
      } else {
        draft[index] = order;
      }
    });
  });

const getData = (responseData: Orders): Orders_party_orders[] | null =>
  responseData?.party?.orders || null;
const getDelta = (subscriptionData: OrderSub) => subscriptionData.orders || [];

export const ordersDataProvider = makeDataProvider(
  ORDERS_QUERY,
  ORDERS_SUB,
  update,
  getData,
  getDelta
);
