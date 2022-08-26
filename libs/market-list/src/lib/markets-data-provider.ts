import produce from 'immer';
import { gql, useQuery } from '@apollo/client';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type {
  MarketDataSub,
  MarketDataSub_marketData,
  MarketList,
  MarketList_markets,
} from './__generated__';
import { useMemo } from 'react';
import { Interval } from '@vegaprotocol/types';
import { mapDataToMarketList } from './utils';

export const useMarketList = () => {
  const since = useMemo(() => {
    const yesterday = Math.round(new Date().getTime() / 1000) - 24 * 3600;
    return new Date(yesterday * 1000).toISOString();
  }, []);
  const { data, loading, error } = useQuery<MarketList>(MARKET_LIST_QUERY, {
    variables: { interval: Interval.INTERVAL_I1H, since },
  });

  return {
    data: useMemo(() => data && mapDataToMarketList(data), [data]),
    loading,
    error,
  };
};

const MARKET_DATA_FRAGMENT = gql`
  fragment MarketDataFields on MarketData {
    market {
      id
      state
      tradingMode
    }
    bestBidPrice
    bestOfferPrice
    markPrice
    trigger
    indicativeVolume
  }
`;

export const MARKET_LIST_QUERY = gql`
  query MarketList($interval: Interval!, $since: String!) {
    markets {
      id
      name
      decimalPlaces
      positionDecimalPlaces
      state
      tradingMode
      fees {
        factors {
          makerFee
          infrastructureFee
          liquidityFee
        }
      }
      data {
        market {
          id
          state
          tradingMode
        }
        bestBidPrice
        bestOfferPrice
        markPrice
        trigger
        indicativeVolume
      }
      tradableInstrument {
        instrument {
          id
          name
          code
          metadata {
            tags
          }
          product {
            ... on Future {
              settlementAsset {
                symbol
              }
            }
          }
        }
      }
      marketTimestamps {
        open
        close
      }
      candles(interval: $interval, since: $since) {
        open
        close
        high
        low
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
  data: MarketList_markets[],
  delta: MarketDataSub_marketData
) => {
  return produce(data, (draft) => {
    const index = draft.findIndex((m) => m.id === delta.market.id);
    if (index !== -1) {
      draft[index].data = delta;
    }
    // @TODO - else push new market to draft
  });
};

const getData = (responseData: MarketList): MarketList_markets[] | null =>
  responseData.markets;
const getDelta = (subscriptionData: MarketDataSub): MarketDataSub_marketData =>
  subscriptionData.marketData;

export const marketsDataProvider = makeDataProvider<
  MarketList,
  MarketList_markets[],
  MarketDataSub,
  MarketDataSub_marketData
>(MARKET_LIST_QUERY, MARKET_DATA_SUB, update, getData, getDelta);
