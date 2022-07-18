import produce from 'immer';
import orderBy from 'lodash/orderBy';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type { FillFields } from './__generated__/FillFields';
import type {
  Fills,
  Fills_party_tradesConnection_edges,
  Fills_party_tradesConnection_edges_node,
} from './__generated__/Fills';
import type { FillsSub } from './__generated__/FillsSub';

const FILL_FRAGMENT = gql`
  fragment FillFields on Trade {
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
    market {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      tradableInstrument {
        instrument {
          id
          code
          product {
            ... on Future {
              settlementAsset {
                id
                symbol
                decimals
              }
            }
          }
        }
      }
    }
  }
`;

export const FILLS_QUERY = gql`
  ${FILL_FRAGMENT}
  query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
    party(id: $partyId) {
      id
      tradesConnection(marketId: $marketId, pagination: $pagination) {
        edges {
          node {
            ...FillFields
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const FILLS_SUB = gql`
  ${FILL_FRAGMENT}
  subscription FillsSub($partyId: ID!) {
    trades(partyId: $partyId) {
      ...FillFields
    }
  }
`;

const update = (
  data: (Fills_party_tradesConnection_edges | null)[],
  delta: FillFields[]
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
          draft.unshift({ node, cursor: '', __typename: 'TradeEdge' });
        }
      }
    });
  });
};

const getData = (
  responseData: Fills
): Fills_party_tradesConnection_edges[] | null =>
  responseData.party?.tradesConnection.edges || null;

const getPageInfo = (responseData: Fills): PageInfo | null =>
  responseData.party?.tradesConnection.pageInfo || null;

const getDelta = (subscriptionData: FillsSub) => subscriptionData.trades || [];

export const fillsDataProvider = makeDataProvider(
  FILLS_QUERY,
  FILLS_SUB,
  update,
  getData,
  getDelta,
  {
    getPageInfo,
    append,
    first: 100,
  }
);
