import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import type { PageInfo, Edge } from '@vegaprotocol/data-provider';
import type { Market } from '@vegaprotocol/markets';
import { marketsProvider } from '@vegaprotocol/markets';
import type {
  TradesQuery,
  TradesQueryVariables,
  TradeFieldsFragment,
  TradesUpdateSubscription,
} from './__generated__/Trades';
import { TradesDocument, TradesUpdateDocument } from './__generated__/Trades';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 500;

const getData = (
  responseData: TradesQuery | null
): ({
  cursor: string;
  node: TradeFieldsFragment;
} | null)[] => responseData?.market?.tradesConnection?.edges || [];

const getDelta = (subscriptionData: TradesUpdateSubscription) =>
  subscriptionData?.trades || [];

const update = (
  data: ReturnType<typeof getData> | null,
  delta: ReturnType<typeof getDelta>
) => {
  if (!data) return data;
  return produce(data, (draft) => {
    // for each incoming trade add it to the beginning and remove oldest trade
    orderBy(delta, 'createdAt', 'desc').forEach((node) => {
      const { marketId, ...nodeData } = node;
      draft.unshift({
        node: {
          ...nodeData,
          __typename: 'Trade',
          market: {
            __typename: 'Market',
            id: marketId,
          },
        },
        cursor: '',
      });

      if (draft.length > MAX_TRADES) {
        draft.pop();
      }
    });
  });
};

export type Trade = Omit<TradeFieldsFragment, 'market'> & { market?: Market };
export type TradeEdge = Edge<Trade>;

const getPageInfo = (responseData: TradesQuery | null): PageInfo | null =>
  responseData?.market?.tradesConnection?.pageInfo || null;

export const tradesProvider = makeDataProvider<
  Parameters<typeof getData>['0'],
  ReturnType<typeof getData>,
  Parameters<typeof getDelta>['0'],
  ReturnType<typeof getDelta>,
  TradesQueryVariables
>({
  query: TradesDocument,
  subscriptionQuery: TradesUpdateDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: MAX_TRADES,
  },
});

export const tradesWithMarketProvider = makeDerivedDataProvider<
  (TradeEdge | null)[],
  Trade[],
  TradesQueryVariables
>(
  [
    tradesProvider,
    (callback, client) => marketsProvider(callback, client, undefined),
  ],
  (partsData): (TradeEdge | null)[] | null => {
    const edges = partsData[0] as ReturnType<typeof getData>;
    return edges.map((edge) => {
      if (edge === null) {
        return null;
      }
      const node = {
        ...edge.node,
        market: (partsData[1] as Market[]).find(
          (market) => market.id === edge.node.market.id
        ),
      };
      const cursor = edge?.cursor || '';
      return {
        cursor,
        node,
      };
    });
  }
);
