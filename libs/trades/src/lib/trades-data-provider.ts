import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { TradeFields } from './__generated__/TradeFields';
import type { Trades } from './__generated__/Trades';
import type { TradesSub } from './__generated__/TradesSub';

const TRADES_FRAGMENT = gql`
  fragment TradeFields on Trade {
    id
    price
    size
    createdAt
    aggressor
  }
`;

export const TRADES_QUERY = gql`
  ${TRADES_FRAGMENT}
  query Trades($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      decimalPlaces
      tradableInstrument {
        instrument {
          id
          name
          code
          product {
            ... on Future {
              quoteName
              settlementAsset {
                id
                symbol
                name
                decimals
              }
            }
          }
        }
      }
      trades(last: 50) {
        ...TradeFields
      }
    }
  }
`;

export const TRADES_SUB = gql`
  ${TRADES_FRAGMENT}
  subscription TradesSub($marketId: ID!) {
    trades(marketId: $marketId) {
      ...TradeFields
    }
  }
`;

const update = (draft: TradeFields[], delta: TradeFields[]) => {
  console.log(draft, delta);
};

const getData = (responseData: Trades): TradeFields[] | null =>
  responseData.market ? responseData.market.trades : null;

const getDelta = (subscriptionData: TradesSub): TradeFields[] =>
  subscriptionData?.trades || [];

export const tradesDataProvider = makeDataProvider(
  TRADES_QUERY,
  TRADES_SUB,
  update,
  getData,
  getDelta
);
