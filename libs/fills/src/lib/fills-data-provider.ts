import produce from 'immer';
import orderBy from 'lodash/orderBy';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { Schema } from '@vegaprotocol/types';
import type {
  FillFieldsFragment,
  FillsQuery,
  FillsEventSubscription,
} from './__generated__/Fills';
import { FillsDocument, FillsEventDocument } from './__generated__/Fills';

const update = (
  data: (Pick<Schema.TradeEdge, '__typename' | 'cursor'> & { node: FillFieldsFragment } | null)[],
  delta: FillFieldsFragment[]
) => {
  return produce(data, (draft) => {
    orderBy(delta, 'createdAt').forEach((node) => {
      const index = draft.findIndex((edge) => edge?.node.id === node.id);
      if (index !== -1) {
        if (draft[index]?.node) {
          Object.assign(
            draft[index]?.node as FillFieldsFragment,
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
  responseData: FillsQuery
) => responseData.party?.tradesConnection.edges || null;

const getPageInfo = (responseData: FillsQuery) =>
  responseData.party?.tradesConnection.pageInfo || null;

const getDelta = (subscriptionData: FillsEventSubscription) => subscriptionData.trades || [];

export const fillsDataProvider = makeDataProvider({
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
