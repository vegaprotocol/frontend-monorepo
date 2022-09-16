import produce from 'immer';
import orderBy from 'lodash/orderBy';
import { gql } from '@apollo/client';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type {
  Fills,
  Fills_party_tradesConnection_edges,
  Fills_party_tradesConnection_edges_node,
} from './__generated__/Fills';
import type { FillsSub, FillsSub_trades } from './__generated__/FillsSub';

export const FILLS_QUERY = gql`
  query Fills($partyId: ID!, $marketId: ID, $pagination: Pagination) {
    party(id: $partyId) {
      id
      tradesConnection(marketId: $marketId, pagination: $pagination) {
        edges {
          node {
            id
            market {
              id
            }
            createdAt
            price
            size
            buyOrder
            sellOrder
            aggressor
            buyer {
              id
            }
            seller {
              id
            }
            buyerFee {
              makerFee
              infrastructureFee
              liquidityFee
            }
            sellerFee {
              makerFee
              infrastructureFee
              liquidityFee
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

export const FILLS_SUB = gql`
  subscription FillsSub($partyId: ID!) {
    trades(partyId: $partyId) {
      id
      marketId
      buyOrder
      sellOrder
      buyerId
      sellerId
      aggressor
      price
      size
      createdAt
      type
      buyerFee {
        makerFee
        infrastructureFee
        liquidityFee
      }
      sellerFee {
        makerFee
        infrastructureFee
        liquidityFee
      }
    }
  }
`;

const update = (
  data: (Fills_party_tradesConnection_edges | null)[],
  delta: FillsSub_trades[]
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt').forEach((node) => {
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(
            draft[index]?.node as Fills_party_tradesConnection_edges_node,
            node
          );
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

export type Trade = Fills_party_tradesConnection_edges_node;
export type TradeWithMarket = Omit<Trade, 'market'> & { market?: Market };
export type TradeWithMarketEdge = {
  cursor: Fills_party_tradesConnection_edges['cursor'];
  node: TradeWithMarket;
};

const getData = (responseData: Fills): Fills_party_tradesConnection_edges[] =>
  responseData.party?.tradesConnection?.edges || [];

const getPageInfo = (responseData: Fills): PageInfo | null =>
  responseData.party?.tradesConnection?.pageInfo || null;

const getDelta = (subscriptionData: FillsSub) => subscriptionData.trades || [];

export const fillsProvider = makeDataProvider({
  query: FILLS_QUERY,
  subscriptionQuery: FILLS_SUB,
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
  (TradeWithMarketEdge | null)[],
  TradeWithMarket[]
>(
  [fillsProvider, marketsProvider],
  (partsData): (TradeWithMarketEdge | null)[] =>
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
  (parts): TradeWithMarket[] | undefined => {
    if (!parts[0].isUpdate) {
      return;
    }
    // map FillsSub_trades[] from subscription to updated TradeWithMarket[]
    return (parts[0].delta as ReturnType<typeof getDelta>).map(
      (deltaTrade) => ({
        ...((parts[0].data as ReturnType<typeof getData>)?.find(
          (trade) => trade.node.id === deltaTrade.id
        )?.node as Fills_party_tradesConnection_edges_node),
        market: (parts[1].data as Market[]).find(
          (market) => market.id === deltaTrade.marketId
        ),
      })
    );
  }
);
