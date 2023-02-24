import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
  paginatedCombineDelta as combineDelta,
  paginatedCombineInsertionData as combineInsertionData,
} from '@vegaprotocol/utils';
import type { PageInfo, Edge } from '@vegaprotocol/utils';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type {
  TradesQuery,
  TradeFieldsFragment,
  TradesUpdateSubscription,
} from './__generated__/Trades';
import { TradesDocument, TradesUpdateDocument } from './__generated__/Trades';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 50;

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
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt', 'desc').forEach((node) => {
      if (!draft) {
        return;
      }
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft?.[index]?.node) {
          Object.assign(draft[index]?.node as TradeFieldsFragment, node);
        }
      } else {
        const firstNode = draft[0]?.node;
        if (firstNode && node.createdAt >= firstNode.createdAt) {
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
        }
      }
    });
  });
};

export type Trade = Omit<TradeFieldsFragment, 'market'> & { market?: Market };
export type TradeEdge = Edge<Trade>;

const getPageInfo = (responseData: TradesQuery): PageInfo | null =>
  responseData.market?.tradesConnection?.pageInfo || null;

export const tradesProvider = makeDataProvider({
  query: TradesDocument,
  subscriptionQuery: TradesUpdateDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const tradesWithMarketProvider = makeDerivedDataProvider<
  (TradeEdge | null)[],
  Trade[]
>(
  [tradesProvider, marketsProvider],
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
  },
  combineDelta<Trade, ReturnType<typeof getDelta>['0']>,
  combineInsertionData<Trade>
);
