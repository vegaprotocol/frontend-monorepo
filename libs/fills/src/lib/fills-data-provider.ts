import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { FillFields } from './__generated__/FillFields';
import type {
  Fills,
  Fills_party_tradesPaged_edges_node,
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
      tradesPaged(marketId: $marketId, pagination: $pagination) {
        totalCount
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

const update = (draft: FillFields[], delta: FillFields[]) => {
  // Add or update incoming trades
  delta.forEach((trade) => {
    const index = draft.findIndex((t) => t.id === trade.id);
    if (index === -1) {
      draft.unshift(trade);
    } else {
      draft[index] = trade;
    }
  });
};

const getData = (
  responseData: Fills
): Fills_party_tradesPaged_edges_node[] | null =>
  responseData.party?.tradesPaged.edges.map((e) => e.node) || null;
const getDelta = (subscriptionData: FillsSub) => subscriptionData.trades || [];

export const fillsDataProvider = makeDataProvider(
  FILLS_QUERY,
  FILLS_SUB,
  update,
  getData,
  getDelta
);
