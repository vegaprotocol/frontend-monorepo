import produce from 'immer';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import {
  makeDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/react-helpers';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import {
  OrdersDocument,
  OrderEventDocument,
} from '../../order-hooks/__generated__/Orders';
import type {
  OrdersQuery,
  OrderEventSubscription,
  OrderFieldsFragment,
  OrderConnectionFieldsFragment,
} from '../../order-hooks/__generated__/Orders';

export const update = (
  data: OrderConnectionFieldsFragment[],
  delta: OrderFieldsFragment[]
) => {
  return produce(data, (draft) => {
    // A single update can contain the same order with multiple updates, so we need to find
    // the latest version of the order and only update using that
    const incoming = uniqBy(
      orderBy(delta, (order) => order.updatedAt || order.createdAt, 'desc'),
      'id'
    );

    // Add or update incoming orders
    incoming.reverse().forEach((node) => {
      const index = draft.findIndex((edge) => edge.node.id === node.id);
      const newer =
        (node.updatedAt || node.createdAt) >=
        (draft[0].node.updatedAt || draft[0].node.createdAt);
      if (index !== -1) {
        Object.assign(draft[index].node, node);
        if (newer) {
          draft.unshift(...draft.splice(index, 1));
        }
      } else if (newer) {
        draft.unshift({ node, cursor: '', __typename: 'OrderEdge' });
      }
    });
  });
};

const getData = (
  responseData: OrdersQuery
): OrderConnectionFieldsFragment[] | null =>
  responseData?.party?.ordersConnection.edges || null;

const getDelta = (subscriptionData: OrderEventSubscription) =>
  subscriptionData.orders || [];

const getPageInfo = (responseData: OrdersQuery): PageInfo | null =>
  responseData.party?.ordersConnection.pageInfo || null;

export const ordersDataProvider = makeDataProvider({
  query: OrdersDocument,
  subscriptionQuery: OrderEventDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});
