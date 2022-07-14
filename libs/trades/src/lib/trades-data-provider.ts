import { gql } from '@apollo/client';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import type { TradeFields } from './__generated__/TradeFields';
import type {
  Trades,
  Trades_market_tradesConnection_edges,
  Trades_market_tradesConnection_edges_node,
} from './__generated__/Trades';
import type { TradesSub } from './__generated__/TradesSub';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 50;

const TRADES_FRAGMENT = gql`
  fragment TradeFields on Trade {
    id
    price
    size
    createdAt
    market {
      id
      decimalPlaces
      positionDecimalPlaces
    }
  }
`;

export const TRADES_QUERY = gql`
  ${TRADES_FRAGMENT}
  query Trades($marketId: ID!, $pagination: Pagination) {
    market(id: $marketId) {
      id
      tradesConnection(pagination: $pagination) {
        totalCount
        edges {
          node {
            ...TradeFields
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const TRADES_SUB = gql`
  ${TRADES_FRAGMENT}
  subscription TradesSub($marketId: ID!) {
    trades(marketId: $marketId) {
      ...TradeFields
    }
  }
`;

const update = (
  data: (Trades_market_tradesConnection_edges | null)[],
  delta: TradeFields[]
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
          draft.unshift({ node, cursor: '', __typename: 'TradeEdge' });
        }
      }
    });
  });
};

const getData = (
  responseData: Trades
): Trades_market_tradesConnection_edges[] | null =>
  responseData.market ? responseData.market.tradesConnection.edges : null;

const getDelta = (subscriptionData: TradesSub): TradeFields[] =>
  subscriptionData?.trades || [];

const getPageInfo = (responseData: Trades): PageInfo | null =>
  responseData.market?.tradesConnection.pageInfo || null;

const getTotalCount = (responseData: Trades): number | undefined =>
  responseData.market?.tradesConnection.totalCount;

export const tradesDataProvider = makeDataProvider(
  TRADES_QUERY,
  TRADES_SUB,
  update,
  getData,
  getDelta,
  {
    getPageInfo,
    getTotalCount,
    append,
    first: 100,
  }
);
