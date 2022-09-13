import produce from 'immer';
import { gql } from '@apollo/client';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type {
  Orders,
  Orders_party_ordersConnection_edges,
  OrderSub,
  OrderFields,
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
              decimalPlaces
              positionDecimalPlaces
              tradableInstrument {
                instrument {
                  id
                  code
                  name
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
  delta: OrderFields[]
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
        draft.unshift({ node, cursor: '', __typename: 'OrderEdge' });
      }
    });
  });
};

const getData = (
  responseData: Orders
): Orders_party_ordersConnection_edges[] | null =>
  responseData?.party?.ordersConnection.edges || null;

const getDelta = (subscriptionData: OrderSub) => subscriptionData.orders || [];

const getPageInfo = (responseData: Orders): PageInfo | null =>
  responseData.party?.ordersConnection.pageInfo || null;

export const ordersDataProvider = makeDataProvider({
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
