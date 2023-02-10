import produce from 'immer';
import { useMemo } from 'react';
import {
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import {
  MarketDataDocument,
  MarketDataUpdateDocument,
} from './__generated__/market-data';
import type {
  MarketDataQuery,
  MarketDataFieldsFragment,
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment,
} from './__generated__/market-data';

export type MarketData = MarketDataFieldsFragment;

const update = (
  data: MarketData | null,
  delta: MarketDataUpdateFieldsFragment
) => {
  return (
    data &&
    produce(data, (draft) => {
      const { marketId, __typename, ...marketData } = delta;
      Object.assign(draft, marketData);
    })
  );
};

const getData = (responseData: MarketDataQuery | null): MarketData | null =>
  responseData?.marketsConnection?.edges[0].node.data || null;

const getDelta = (
  subscriptionData: MarketDataUpdateSubscription
): MarketDataUpdateFieldsFragment => subscriptionData.marketsData[0];

export const marketDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketData,
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment
>({
  query: MarketDataDocument,
  subscriptionQuery: MarketDataUpdateDocument,
  update,
  getData,
  getDelta,
});

export type StaticMarketData = Pick<
  MarketData,
  | 'marketTradingMode'
  | 'marketState'
  | 'auctionStart'
  | 'auctionEnd'
  | 'indicativePrice'
  | 'indicativeVolume'
  | 'suppliedStake'
  | 'targetStake'
  | 'trigger'
>;

export const staticMarketDataProvider = makeDerivedDataProvider<
  StaticMarketData,
  never
>([marketDataProvider], (parts, variables, prevData) => {
  const marketData = parts[0] as ReturnType<typeof getData>;
  if (!marketData) {
    return marketData;
  }
  const data: StaticMarketData = {
    marketTradingMode: marketData.marketTradingMode,
    marketState: marketData.marketState,
    auctionStart: marketData.auctionStart,
    auctionEnd: marketData.auctionEnd,
    indicativePrice: marketData.indicativePrice,
    indicativeVolume: marketData.indicativeVolume,
    suppliedStake: marketData.suppliedStake,
    targetStake: marketData.targetStake,
    trigger: marketData.trigger,
  };
  if (!prevData) {
    return data;
  }
  return produce(prevData, (draft) => {
    Object.assign(draft, data);
  });
});

export const useStaticMarketData = (marketId?: string, skip?: boolean) => {
  const variables = useMemo(() => ({ marketId }), [marketId]);
  return useDataProvider({
    dataProvider: staticMarketDataProvider,
    variables,
    skip: skip || !marketId,
  });
};
