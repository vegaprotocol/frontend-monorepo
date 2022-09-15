import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type {
  Trades,
  Trades_market_tradesConnection_edges,
  Trades_market_tradesConnection_edges_node,
} from './__generated__/Trades';
import type { TradesSub, TradesSub_trades } from './__generated__/TradesSub';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 50;

export const TRADES_QUERY = gql`
  query Trades($marketId: ID!, $pagination: Pagination) {
    market(id: $marketId) {
      id
      tradesConnection(pagination: $pagination) {
        edges {
          node {
            id
            price
            size
            createdAt
            market {
              id
            }
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

export const TRADES_SUB = gql`
  subscription TradesSub($marketId: ID!) {
    trades(marketId: $marketId) {
      id
      price
      size
      createdAt
      marketId
    }
  }
`;

const update = (
  data: (Trades_market_tradesConnection_edges | null)[],
  delta: TradesSub_trades[]
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt', 'desc').forEach((node) => {
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(
            draft[index]?.node as Trades_market_tradesConnection_edges_node,
            node
          );
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
            __typename: 'TradeEdge',
          });
        }
      }
    });
  });
};

export type Trade = Trades_market_tradesConnection_edges_node;
export type TradeWithMarket = Omit<Trade, 'market'> & { market?: Market };
export type TradeWithMarketEdge = {
  cursor: Trades_market_tradesConnection_edges['cursor'];
  node: TradeWithMarket;
};

const getData = (
  responseData: Trades
): Trades_market_tradesConnection_edges[] | null =>
  responseData?.market?.tradesConnection?.edges || null;

const getDelta = (subscriptionData: TradesSub): TradesSub_trades[] =>
  subscriptionData?.trades || [];

const getPageInfo = (responseData: Trades): PageInfo | null =>
  responseData.market?.tradesConnection?.pageInfo || null;

export const tradesProvider = makeDataProvider({
  query: TRADES_QUERY,
  subscriptionQuery: TRADES_SUB,
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
  TradeWithMarketEdge[],
  TradeWithMarket[]
>(
  [tradesProvider, marketsProvider],
  (partsData): TradeWithMarketEdge[] | null =>
    (partsData[0] as ReturnType<typeof getData>)?.map((edge) => ({
      cursor: edge.cursor,
      node: {
        ...edge.node,
        market: (partsData[1] as Market[]).find(
          (market) => market.id === edge.node.market.id
        ),
      },
    })) || null,
  (parts): TradeWithMarket[] | undefined => {
    if (!parts[0].isUpdate) {
      return;
    }
    // map FillsSub_trades[] from subscription to updated TradeWithMarket[]
    return (parts[0].delta as ReturnType<typeof getDelta>).map(
      (deltaTrade) => ({
        ...((parts[0].data as ReturnType<typeof getData>)?.find(
          (trade) => trade.node.id === deltaTrade.id
        )?.node as Trades_market_tradesConnection_edges_node),
        market: (parts[1].data as Market[]).find(
          (market) => market.id === deltaTrade.marketId
        ),
      })
    );
  }
);
