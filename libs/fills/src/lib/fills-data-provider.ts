import produce from 'immer';
import orderBy from 'lodash/orderBy';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type {
  Fills,
  Fills_party_tradesConnection_edges,
  Fills_party_tradesConnection_edges_node,
} from './__generated__/Fills';
import type { FillsSub, FillsSub_trades } from './__generated__/FillsSub';

export const FILLS_QUERY = gql`
  query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
    party(id: $partyId) {
      id
      tradesConnection(marketId: $marketId, pagination: $pagination) {
        edges {
          node {
            id
            createdAt
            price
            size
            buyOrder
            sellOrder
            aggressor
            buyer {
              id
            }
            seller {
              id
            }
            buyerFee {
              makerFee
              infrastructureFee
              liquidityFee
            }
            sellerFee {
              makerFee
              infrastructureFee
              liquidityFee
            }
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

export const FILLS_SUB = gql`
  subscription FillsSub($partyId: ID!) {
    trades(partyId: $partyId) {
      id
      marketId
      buyOrder
      sellOrder
      buyerId
      sellerId
      aggressor
      price
      size
      createdAt
      type
      buyerFee {
        makerFee
        infrastructureFee
        liquidityFee
      }
      sellerFee {
        makerFee
        infrastructureFee
        liquidityFee
      }
    }
  }
`;

const update = (
  data: (Fills_party_tradesConnection_edges | null)[],
  delta: FillsSub_trades[]
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt').forEach((node) => {
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(
            draft[index]?.node as Fills_party_tradesConnection_edges_node,
            node
          );
        }
      } else {
        const firstNode = draft[0]?.node;
        if (firstNode && node.createdAt >= firstNode.createdAt) {
          const { buyerId, sellerId, ...trade } = node;
          draft.unshift({
            node: {
              ...trade,
              __typename: 'Trade',
              buyer: { id: buyerId, __typename: 'Party' },
              seller: { id: buyerId, __typename: 'Party' },
            },
            cursor: '',
            __typename: 'TradeEdge',
          });
        }
      }
    });
  });
};

const getData = (
  responseData: Fills
): Fills_party_tradesConnection_edges[] | null =>
  responseData.party?.tradesConnection?.edges || null;

const getPageInfo = (responseData: Fills): PageInfo | null =>
  responseData.party?.tradesConnection?.pageInfo || null;

const getDelta = (subscriptionData: FillsSub) => subscriptionData.trades || [];

export const fillsDataProvider = makeDataProvider({
  query: FILLS_QUERY,
  subscriptionQuery: FILLS_SUB,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});
