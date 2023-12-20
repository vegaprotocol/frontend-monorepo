import produce from 'immer';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  MarketDataDocument,
  MarketDataUpdateDocument,
  type MarketDataQuery,
  type MarketDataFieldsFragment,
  type MarketDataUpdateSubscription,
  type MarketDataUpdateFieldsFragment,
  type MarketDataQueryVariables,
} from './__generated__/market-data';
import { getMarketPrice } from './get-price';
import { MarketTradingMode } from '@vegaprotocol/types';

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
  responseData?.marketsConnection?.edges[0]?.node?.data || null;

const getDelta = (
  subscriptionData: MarketDataUpdateSubscription
): MarketDataUpdateFieldsFragment => subscriptionData.marketsData[0];

export const marketDataProvider = makeDataProvider<
  MarketDataQuery,
  MarketData,
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment,
  MarketDataQueryVariables
>({
  query: MarketDataDocument,
  subscriptionQuery: MarketDataUpdateDocument,
  update,
  getData,
  getDelta,
});

export const markPriceProvider = makeDerivedDataProvider<
  string,
  never,
  MarketDataQueryVariables
>([marketDataProvider], ([marketData]) => (marketData as MarketData).markPrice);

export const marketPriceProvider = makeDerivedDataProvider<
  string | undefined,
  never,
  MarketDataQueryVariables
>([marketDataProvider], ([marketData]) =>
  getMarketPrice(marketData as MarketData)
);

export const useMarketPrice = (marketId?: string, skip?: boolean) =>
  useDataProvider({
    dataProvider: marketPriceProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
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
  never,
  MarketDataQueryVariables
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

export const marketTradingModeProvider = makeDerivedDataProvider<
  MarketDataFieldsFragment['marketTradingMode'] | undefined,
  never,
  MarketDataQueryVariables
>(
  [marketDataProvider],
  (parts, variables, prevData) =>
    (parts[0] as ReturnType<typeof getData>)?.marketTradingMode
);

export const fundingRateStartTimeProvider = makeDerivedDataProvider<
  NonNullable<MarketDataFieldsFragment['productData']>['startTime'] | undefined,
  never,
  MarketDataQueryVariables
>(
  [marketDataProvider],
  (parts, variables, prevData) =>
    (parts[0] as ReturnType<typeof getData>)?.productData?.startTime
);

export const marketStateProvider = makeDerivedDataProvider<
  MarketDataFieldsFragment['marketState'] | undefined,
  never,
  MarketDataQueryVariables
>(
  [marketDataProvider],
  (parts, variables, prevData) =>
    (parts[0] as ReturnType<typeof getData>)?.marketState
);

export const fundingRateProvider = makeDerivedDataProvider<
  string,
  never,
  MarketDataQueryVariables
>([marketDataProvider], (parts) => {
  const marketData = parts[0] as ReturnType<typeof getData>;
  return marketData &&
    ![
      MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
      MarketTradingMode.TRADING_MODE_SUSPENDED_VIA_GOVERNANCE,
    ].includes(marketData.marketTradingMode)
    ? marketData?.productData?.fundingRate || null
    : null;
});

export const useFundingRate = (marketId?: string, skip?: boolean) =>
  useDataProvider({
    dataProvider: fundingRateProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });

export const externalTwapProvider = makeDerivedDataProvider<
  string,
  never,
  MarketDataQueryVariables
>([marketDataProvider], (parts) => {
  return (
    (parts[0] as ReturnType<typeof getData>)?.productData?.externalTwap || null
  );
});

export const useExternalTwap = (marketId?: string, skip?: boolean) =>
  useDataProvider({
    dataProvider: externalTwapProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });

export const useStaticMarketData = (marketId?: string, skip?: boolean) => {
  return useDataProvider({
    dataProvider: staticMarketDataProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });
};

export const useMarketTradingMode = (marketId?: string, skip?: boolean) => {
  return useDataProvider({
    dataProvider: marketTradingModeProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });
};

export const useFundingPeriodStartTime = (
  marketId?: string,
  skip?: boolean
) => {
  return useDataProvider({
    dataProvider: fundingRateStartTimeProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });
};

export const useMarketState = (marketId?: string, skip?: boolean) => {
  return useDataProvider({
    dataProvider: marketStateProvider,
    variables: { marketId: marketId || '' },
    skip: skip || !marketId,
  });
};
