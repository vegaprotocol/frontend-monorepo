import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type {
  TradesQuery,
  TradeFieldsFragment,
  TradesUpdateSubscription,
} from './__generated___/Trades';
import { TradesDocument, TradesUpdateDocument } from './__generated___/Trades';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 50;

const getData = (
  responseData: TradesQuery
): ({
  cursor: string;
  node: TradeFieldsFragment;
} | null)[] => responseData?.market?.tradesConnection?.edges || [];

const getDelta = (subscriptionData: TradesUpdateSubscription) =>
  subscriptionData?.trades || [];

const update = (
  data: ReturnType<typeof getData>,
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
export type TradeEdge = {
  cursor: string;
  node: Trade;
};

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
  (parts): Trade[] | undefined => {
    if (!parts[0].isUpdate) {
      return;
    }
    // map FillsSub_trades[] from subscription to updated Trade[]
    return (parts[0].delta as ReturnType<typeof getDelta>).map(
      (deltaTrade) => ({
        ...((parts[0].data as ReturnType<typeof getData>)?.find(
          (edge) => edge?.node.id === deltaTrade.id
        )?.node as Trade),
        market: (parts[1].data as Market[]).find(
          (market) => market.id === deltaTrade.marketId
        ),
      })
    );
  }
);
