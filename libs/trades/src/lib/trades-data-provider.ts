import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { TradeFields } from './__generated__/TradeFields';
import type { Trades } from './__generated__/Trades';
import type { TradesSub } from './__generated__/TradesSub';
import orderBy from 'lodash/orderBy';

const TRADES_FRAGMENT = gql`
  fragment TradeFields on Trade {
    id
    price
    size
    createdAt
    aggressor
    market {
      id
      decimalPlaces
    }
  }
`;

export const TRADES_QUERY = gql`
  ${TRADES_FRAGMENT}
  query Trades($marketId: ID!) {
    market(id: $marketId) {
      id
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

export const prepareIncomingTrades = (trades: TradeFields[]) => {
  return orderBy(
    trades,
    (t) => {
      return new Date(t.createdAt).getTime();
    },
    'desc'
  );
};

const update = (draft: TradeFields[], delta: TradeFields[]) => {
  const incoming = prepareIncomingTrades(delta);
  draft.unshift(...incoming);
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
