import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { TradesDocument, TradesEventDocument } from './__generated__/Trades';
import type { TradeFieldsFragment, TradesQuery, TradesEventSubscription } from './__generated__/Trades';
import orderBy from 'lodash/orderBy';
import produce from 'immer';

export const MAX_TRADES = 50;

type TradesItem = Pick<Schema.TradeEdge, 'cursor' | '__typename'> & {
  node: TradeFieldsFragment,
}

const update = (
  data: (TradesItem | null)[],
  delta: TradeFieldsFragment[]
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt', 'desc').forEach((node) => {
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(
            draft[index]?.node as TradeFieldsFragment,
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
  responseData: TradesQuery
): TradesItem[] | null =>
  responseData.market ? responseData.market.tradesConnection.edges : null;

const getDelta = (subscriptionData: TradesEventSubscription): TradeFieldsFragment[] =>
  subscriptionData?.trades || [];

const getPageInfo = (responseData: TradesQuery): PageInfo | null =>
  responseData.market?.tradesConnection.pageInfo || null;

export const tradesDataProvider = makeDataProvider({
  query: TradesDocument,
  subscriptionQuery: TradesEventDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});
