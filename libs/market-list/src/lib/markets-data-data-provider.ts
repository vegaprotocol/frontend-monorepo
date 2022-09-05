import produce from 'immer';
import { gql } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataSub,
  MarketDataSub_marketData,
  MarketData,
  MarketData_markets_data,
} from './__generated__';

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketDataFields on MarketData {
    market {
      id
    }
    bestBidPrice
    bestOfferPrice
    markPrice
    trigger
    staticMidPrice
    marketTradingMode
    indicativeVolume
    indicativePrice
    bestStaticBidPrice
    bestStaticOfferPrice
  }
`;

export const MARKET_DATA_QUERY = gql`
  ${MARKET_DATA_FRAGMENT}
  query MarketData {
    markets {
      data {
        ...MarketDataFields
      }
    }
  }
`;

const MARKET_DATA_SUB = gql`
  ${MARKET_DATA_FRAGMENT}
  subscription MarketDataSub {
    marketData {
      ...MarketDataFields
    }
  }
`;

const update = (
  data: MarketData_markets_data[],
  delta: MarketDataSub_marketData
) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.market.id === delta.market.id);
    if (index !== -1) {
      Object.assign(draft[index], delta);
    } else {
      draft.push(delta);
    }
  });
};

const getData = (responseData: MarketData): MarketData_markets_data[] | null =>
  responseData.markets
    ?.filter((market) => market.data)
    .map<MarketData_markets_data>(
      (market) => market.data as MarketData_markets_data
    ) || null;
const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketData =>
  subscriptionData.marketData;

export const marketsDataDataProvider = makeDataProvider<
  MarketData,
  MarketData_markets_data[],
  MarketDataSub,
  MarketDataSub_marketData
>({
  query: MARKET_DATA_QUERY,
  subscriptionQuery: MARKET_DATA_SUB,
  update,
  getData,
  getDelta,
});
