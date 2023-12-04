import orderBy from 'lodash/orderBy';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import { type PageInfo, type Cursor } from '@vegaprotocol/data-provider';
import { type Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import {
  TradesDocument,
  TradesUpdateDocument,
  type TradesQuery,
  type TradesQueryVariables,
  type TradeFieldsFragment,
  type TradesUpdateSubscription,
  type TradeUpdateFieldsFragment,
  type TradesUpdateSubscriptionVariables,
} from './__generated__/Trades';

export const MAX_TRADES = 500;

const getData = (
  responseData: TradesQuery | null
): (TradeFieldsFragment & Cursor)[] =>
  responseData?.trades?.edges.map<TradeFieldsFragment & Cursor>((edge) => ({
    ...edge.node,
    cursor: edge.cursor,
  })) || [];

const getDelta = (subscriptionData: TradesUpdateSubscription) =>
  subscriptionData?.tradesStream || [];

const mapTradeUpdateToTrade = (
  tradeUpdate: TradeUpdateFieldsFragment
): TradeFieldsFragment => {
  const { marketId, ...trade } = tradeUpdate;
  return {
    ...trade,
    __typename: 'Trade',
    market: {
      __typename: 'Market',
      id: marketId,
    },
  };
};

const mapTradeUpdateToTradeWithMarket =
  (markets: Record<string, Market>) =>
  (tradeUpdate: TradeUpdateFieldsFragment): Trade => {
    const { market, ...trade } = mapTradeUpdateToTrade(tradeUpdate);
    return {
      ...trade,
      market: markets[market.id],
    };
  };

const update = <T extends Omit<TradeFieldsFragment, 'market'> & Cursor>(
  data: T[] | null,
  delta: ReturnType<typeof getDelta>,
  variables: TradesQueryVariables,
  mapDeltaToData: (delta: TradeUpdateFieldsFragment) => T
): T[] => {
  const updatedData = data ? [...data] : ([] as T[]);
  orderBy(delta, 'createdAt', 'desc').forEach((tradeUpdate) => {
    const index = data?.findIndex((trade) => trade.id === tradeUpdate.id) ?? -1;
    if (index !== -1) {
      updatedData[index] = {
        ...updatedData[index],
        ...mapDeltaToData(tradeUpdate),
      };
    } else if (!data?.length || tradeUpdate.createdAt >= data[0].createdAt) {
      updatedData.unshift(mapDeltaToData(tradeUpdate));
    }
  });
  return updatedData.slice(0, MAX_TRADES);
};

export type Trade = Omit<TradeFieldsFragment, 'market'> & { market?: Market };

const getPageInfo = (responseData: TradesQuery | null): PageInfo | null =>
  responseData?.trades?.pageInfo || null;

export const tradesProvider = makeDataProvider<
  Parameters<typeof getData>['0'],
  ReturnType<typeof getData>,
  Parameters<typeof getDelta>['0'],
  ReturnType<typeof getDelta>,
  TradesQueryVariables,
  TradesUpdateSubscriptionVariables
>({
  query: TradesDocument,
  subscriptionQuery: TradesUpdateDocument,
  update: (data, delta, reload, variables) =>
    update(data, delta, variables, mapTradeUpdateToTrade),
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    // first: MAX_TRADES,
    last: MAX_TRADES,
  },
  fetchPolicy: 'no-cache',
  getSubscriptionVariables: ({ marketId }) => ({ marketId }),
});

export const tradesWithMarketProvider = makeDerivedDataProvider<
  (Trade & Cursor)[],
  never,
  TradesQueryVariables
>(
  [
    tradesProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData, variables, prevData, parts): Trade[] | null => {
    if (prevData && parts[0].isUpdate) {
      return update(
        prevData,
        parts[0].delta as ReturnType<typeof getDelta>,
        variables,
        mapTradeUpdateToTradeWithMarket(partsData[1] as Record<string, Market>)
      );
    }
    return ((partsData[0] as ReturnType<typeof getData>) || []).map(
      (trade) => ({
        ...trade,
        market: (partsData[1] as Record<string, Market>)[trade.market.id],
      })
    );
  }
);
