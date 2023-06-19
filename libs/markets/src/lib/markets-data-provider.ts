import { marketDataErrorPolicyGuard } from '@vegaprotocol/data-provider';
import { makeDataProvider } from '@vegaprotocol/data-provider';
import type {
  MarketsDataQuery,
  MarketsDataQueryVariables,
} from './__generated__/markets-data';
import type {
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment,
  MarketDataUpdateSubscriptionVariables,
} from './__generated__/market-data';
import { MarketDataUpdateDocument } from './__generated__/market-data';
import { MarketsDataDocument } from './__generated__/markets-data';
import type { MarketData } from './market-data-provider';

const getData = (responseData: MarketsDataQuery | null): MarketData[] =>
  responseData?.marketsConnection?.edges
    .filter((edge) => edge.node.data)
    .map((edge) => edge.node.data as MarketData) || [];

export const mapMarketDataUpdateToMarketData = (
  delta: MarketDataUpdateFieldsFragment
): MarketData => {
  const { marketId, __typename, ...marketData } = delta;
  return { ...marketData, market: { id: marketId } };
};

const update = (
  data: MarketData[] | null,
  delta: MarketDataUpdateFieldsFragment
) => {
  const updatedData = data ? [...data] : [];
  const item = mapMarketDataUpdateToMarketData(delta);
  const index = updatedData.findIndex(
    (data) => data.market.id === item.market.id
  );
  if (index !== -1) {
    updatedData[index] = { ...updatedData[index], ...item };
  } else {
    updatedData.push(item);
  }
  return updatedData;
};

const getDelta = (
  subscriptionData: MarketDataUpdateSubscription
): MarketDataUpdateFieldsFragment => subscriptionData.marketsData[0];

export const marketsDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketData[],
  never,
  never
>({
  query: MarketsDataDocument,
  getData,
  errorPolicyGuard: marketDataErrorPolicyGuard,
});

type Variables = { marketIds: string[] };

export const marketsLiveDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketData[],
  MarketDataUpdateSubscription,
  MarketDataUpdateFieldsFragment,
  Variables,
  MarketDataUpdateSubscriptionVariables,
  MarketsDataQueryVariables
>({
  query: MarketsDataDocument,
  subscriptionQuery: MarketDataUpdateDocument,
  getData,
  getDelta,
  update,
  errorPolicyGuard: marketDataErrorPolicyGuard,
  getQueryVariables: () => ({}),
  getSubscriptionVariables: ({ marketIds }: Variables) =>
    marketIds.map((marketId) => ({ marketId })),
});
