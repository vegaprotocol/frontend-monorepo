import produce from 'immer';
import { gql } from '@apollo/client';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type {
  Orders,
  Orders_party_ordersConnection_edges,
  Orders_party_ordersConnection_edges_node,
  OrderSub,
  OrderSub_orders,
} from '../';

export const ORDERS_QUERY = gql`
  query Orders($partyId: ID!, $pagination: Pagination) {
    party(id: $partyId) {
      id
      ordersConnection(pagination: $pagination) {
        edges {
          node {
            id
            market {
              id
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
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

export const ORDERS_SUB = gql`
  subscription OrderSub($partyId: ID!) {
    orders(partyId: $partyId) {
      id
      marketId
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
  }
`;

export const update = (
  data: Orders_party_ordersConnection_edges[],
  delta: OrderSub_orders[]
) => {
  return produce(data, (draft) => {
    // A single update can contain the same order with multiple updates, so we need to find
    // the latest version of the order and only update using that
    const incoming = uniqBy(
      orderBy(delta, (order) => order.updatedAt || order.createdAt, 'desc'),
      'id'
    );

    // Add or update incoming orders
    incoming.reverse().forEach((node) => {
      const index = draft.findIndex((edge) => edge.node.id === node.id);
      const newer =
        (node.updatedAt || node.createdAt) >=
        (draft[0].node.updatedAt || draft[0].node.createdAt);
      if (index !== -1) {
        Object.assign(draft[index].node, node);
        if (newer) {
          draft.unshift(...draft.splice(index, 1));
        }
      } else if (newer) {
        const { marketId, ...order } = node;
        draft.unshift({
          node: {
            ...order,
            market: {
              __typename: 'Market',
              id: marketId,
            },
            __typename: 'Order',
          },
          cursor: '',
          __typename: 'OrderEdge',
        });
      }
    });
  });
};

// #TODO Order name is in conflict with interface defines in use-order-submit
type Order = Orders_party_ordersConnection_edges_node;
export type OrderWithMarket = Omit<Order, 'market'> & { market?: Market };
export type OrderWithMarketEdge = {
  node: OrderWithMarket;
  cursor: Orders_party_ordersConnection_edges['cursor'];
};

const getData = (
  responseData: Orders
): Orders_party_ordersConnection_edges[] | null =>
  responseData?.party?.ordersConnection?.edges || null;

const getDelta = (subscriptionData: OrderSub) => subscriptionData.orders || [];

const getPageInfo = (responseData: Orders): PageInfo | null =>
  responseData.party?.ordersConnection?.pageInfo || null;

export const ordersProvider = makeDataProvider({
  query: ORDERS_QUERY,
  subscriptionQuery: ORDERS_SUB,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const ordersWithMarketProvider = makeDerivedDataProvider<
  OrderWithMarketEdge[],
  OrderWithMarket[]
>(
  [ordersProvider, marketsProvider],
  (partsData): OrderWithMarketEdge[] =>
    (partsData[0] as Orders_party_ordersConnection_edges[]).map((edge) => ({
      cursor: edge.cursor,
      node: {
        ...edge.node,
        market: (partsData[1] as Market[]).find(
          (market) => market.id === edge.node.market.id
        ),
      },
    })),
  (parts): OrderWithMarket[] | undefined => {
    if (!parts[0].isUpdate) {
      return;
    }
    // map OrderSub_orders[] from subscription to updated OrderWithMarket[]
    return (parts[0].delta as ReturnType<typeof getDelta>).map(
      (deltaOrder) => ({
        ...((parts[0].data as ReturnType<typeof getData>)?.find(
          (order) => order.node.id === deltaOrder.id
        )?.node as Orders_party_ordersConnection_edges_node),
        market: (parts[1].data as Market[]).find(
          (market) => market.id === deltaOrder.marketId
        ),
      })
    );
  }
);
