import orderBy from 'lodash/orderBy';
import { type PageInfo, type Cursor } from '@vegaprotocol/data-provider';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import { type Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import {
  FillsDocument,
  FillsEventDocument,
  type FillsQuery,
  type FillsQueryVariables,
  type FillFieldsFragment,
  type FillsEventSubscription,
  type FillUpdateFieldsFragment,
  type FillsEventSubscriptionVariables,
} from './__generated__/Fills';

export type Trade = Omit<FillFieldsFragment, 'market'> & {
  market?: Market;
  isLastPlaceholder?: boolean;
};

const getData = (
  responseData: FillsQuery | null
): (FillFieldsFragment & Cursor)[] =>
  responseData?.trades?.edges.map<FillFieldsFragment & Cursor>((edge) => ({
    ...edge.node,
    cursor: edge.cursor,
  })) || [];

const getPageInfo = (responseData: FillsQuery | null): PageInfo | null =>
  responseData?.trades?.pageInfo || null;

const getDelta = (subscriptionData: FillsEventSubscription) =>
  subscriptionData.tradesStream || [];

const mapFillUpdateToFill = (
  fillUpdate: FillUpdateFieldsFragment
): FillFieldsFragment => {
  const { buyerId, sellerId, marketId, ...fill } = fillUpdate;
  return {
    ...fill,
    __typename: 'Trade',
    market: {
      __typename: 'Market',
      id: marketId,
    },
    buyer: { id: buyerId, __typename: 'Party' },
    seller: { id: sellerId, __typename: 'Party' },
  };
};

const mapFillUpdateToFillWithMarket =
  (markets: Record<string, Market>) =>
  (fillUpdate: FillUpdateFieldsFragment): Trade => {
    const { market, ...fill } = mapFillUpdateToFill(fillUpdate);
    return {
      ...fill,
      market: markets[market.id],
    };
  };

const update = <T extends Omit<FillFieldsFragment, 'market'> & Cursor>(
  data: T[] | null,
  delta: ReturnType<typeof getDelta>,
  variables: FillsQueryVariables,
  mapDeltaToData: (delta: FillUpdateFieldsFragment) => T
): T[] => {
  const updatedData = data ? [...data] : ([] as T[]);
  orderBy(delta, 'createdAt', 'desc').forEach((fillUpdate) => {
    const index = data?.findIndex((fill) => fill.id === fillUpdate.id) ?? -1;
    if (index !== -1) {
      updatedData[index] = {
        ...updatedData[index],
        ...mapDeltaToData(fillUpdate),
      };
    } else if (!data?.length || fillUpdate.createdAt >= data[0].createdAt) {
      updatedData.unshift(mapDeltaToData(fillUpdate));
    }
  });
  return updatedData;
};

export const fillsProvider = makeDataProvider<
  Parameters<typeof getData>['0'],
  ReturnType<typeof getData>,
  Parameters<typeof getDelta>['0'],
  ReturnType<typeof getDelta>,
  FillsQueryVariables,
  FillsEventSubscriptionVariables
>({
  query: FillsDocument,
  subscriptionQuery: FillsEventDocument,
  update: (data, delta, reload, variables) =>
    update(data, delta, variables, mapFillUpdateToFill),
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
  getSubscriptionVariables: ({ filter }) => {
    const variables: FillsEventSubscriptionVariables = { filter: {} };
    if (filter) {
      variables.filter = {
        partyIds: filter.partyIds,
        marketIds: filter.marketIds,
      };
    }
    return variables;
  },
});

export const fillsWithMarketProvider = makeDerivedDataProvider<
  Trade[],
  never,
  FillsQueryVariables
>(
  [
    fillsProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData, variables, prevData, parts): Trade[] | null => {
    if (prevData && parts[0].isUpdate) {
      return update(
        prevData,
        parts[0].delta as ReturnType<typeof getDelta>,
        variables,
        mapFillUpdateToFillWithMarket(partsData[1] as Record<string, Market>)
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
