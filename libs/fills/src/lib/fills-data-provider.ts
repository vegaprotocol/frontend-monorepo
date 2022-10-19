import produce from 'immer';
import orderBy from 'lodash/orderBy';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
  paginatedCombineDelta as combineDelta,
  paginatedCombineInsertionData as combineInsertionData,
} from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type { PageInfo, Edge } from '@vegaprotocol/react-helpers';
import { FillsDocument, FillsEventDocument } from './__generated___/Fills';
import type {
  FillsQuery,
  FillFieldsFragment,
  FillEdgeFragment,
  FillsEventSubscription,
} from './__generated___/Fills';

const update = (
  data: FillEdgeFragment[] | null,
  delta: FillsEventSubscription['trades']
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt').forEach((node) => {
      if (draft === null) {
        return;
      }
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(draft[index]?.node as FillFieldsFragment, node);
        }
      } else {
        const firstNode = draft[0]?.node;
        if (firstNode && node.createdAt >= firstNode.createdAt) {
          const { buyerId, sellerId, marketId, ...trade } = node;
          draft.unshift({
            node: {
              ...trade,
              __typename: 'Trade',
              market: {
                __typename: 'Market',
                id: marketId,
              },
              buyer: { id: buyerId, __typename: 'Party' },
              seller: { id: buyerId, __typename: 'Party' },
            },
            cursor: '',
            __typename: 'TradeEdge',
          });
        }
      }
    });
  });
};

export type Trade = Omit<FillFieldsFragment, 'market'> & { market?: Market };
export type TradeEdge = Edge<Trade>;

const getData = (responseData: FillsQuery): FillEdgeFragment[] =>
  responseData.party?.tradesConnection?.edges || [];

const getPageInfo = (responseData: FillsQuery): PageInfo | null =>
  responseData.party?.tradesConnection?.pageInfo || null;

const getDelta = (subscriptionData: FillsEventSubscription) =>
  subscriptionData.trades || [];

export const fillsProvider = makeDataProvider({
  query: FillsDocument,
  subscriptionQuery: FillsEventDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const fillsWithMarketProvider = makeDerivedDataProvider<
  (TradeEdge | null)[],
  Trade[]
>(
  [fillsProvider, marketsProvider],
  (partsData): (TradeEdge | null)[] =>
    (partsData[0] as ReturnType<typeof getData>)?.map(
      (edge) =>
        edge && {
          cursor: edge.cursor,
          node: {
            ...edge.node,
            market: (partsData[1] as Market[]).find(
              (market) => market.id === edge.node.market.id
            ),
          },
        }
    ) || null,
  combineDelta<Trade, ReturnType<typeof getDelta>['0']>,
  combineInsertionData<Trade>
);
