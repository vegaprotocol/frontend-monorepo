import produce from 'immer';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
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
import type {
  OrderFieldsFragment,
  OrdersQuery,
  OrdersUpdateSubscription,
  OrdersQueryVariables,
} from './__generated___/orders';
import { OrdersDocument, OrdersUpdateDocument } from './__generated___/orders';

export type Order = Omit<OrderFieldsFragment, 'market'> & {
  market?: Market;
};
export type OrderEdge = Edge<Order>;

const getData = (responseData: OrdersQuery) =>
  responseData?.party?.ordersConnection?.edges || [];

const getDelta = (subscriptionData: OrdersUpdateSubscription) =>
  subscriptionData.orders || [];

const getPageInfo = (responseData: OrdersQuery): PageInfo | null =>
  responseData.party?.ordersConnection?.pageInfo || null;

export const update = (
  data: ReturnType<typeof getData>,
  delta: ReturnType<typeof getDelta>,
  reload: () => void,
  variables?: OrdersQueryVariables
) => {
  if (!data) {
    return data;
  }
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
        draft.length === 0 ||
        (node.updatedAt || node.createdAt) >=
          (draft[0].node.updatedAt || draft[0].node.createdAt);
      let doesFilterPass = true;
      if (
        doesFilterPass &&
        variables?.dateRange?.start &&
        new Date(node.updatedAt || node.createdAt) <=
          new Date(variables?.dateRange?.start)
      ) {
        doesFilterPass = false;
      }
      if (
        doesFilterPass &&
        variables?.dateRange?.end &&
        new Date(node.updatedAt || node.createdAt) >=
          new Date(variables?.dateRange?.end)
      ) {
        doesFilterPass = false;
      }
      if (index !== -1) {
        if (doesFilterPass) {
          Object.assign(draft[index].node, node);
          if (newer) {
            draft.unshift(...draft.splice(index, 1));
          }
        } else {
          draft.splice(index, 1);
        }
      } else if (newer && doesFilterPass) {
        const { marketId, liquidityProvisionId, ...order } = node;

        // If there is a liquidity provision id add the object to the resulting order
        const liquidityProvision:
          | OrderFieldsFragment['liquidityProvision']
          | null = liquidityProvisionId
          ? {
              __typename: 'LiquidityProvision',
            }
          : null;

        draft.unshift({
          node: {
            ...order,
            liquidityProvision: liquidityProvision,
            market: {
              __typename: 'Market',
              id: marketId,
            },
            __typename: 'Order',
          },
          cursor: '',
          __typename: 'OrderEdge',
        });
      }
    });
  });
};

export const ordersProvider = makeDataProvider({
  query: OrdersDocument,
  subscriptionQuery: OrdersUpdateDocument,
  update,
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const ordersWithMarketProvider = makeDerivedDataProvider<
  (OrderEdge | null)[],
  Order[],
  OrdersQueryVariables
>(
  [ordersProvider, marketsProvider],
  (partsData): OrderEdge[] =>
    ((partsData[0] as ReturnType<typeof getData>) || []).map((edge) => ({
      cursor: edge.cursor,
      node: {
        ...edge.node,
        market: (partsData[1] as Market[]).find(
          (market) => market.id === edge.node.market.id
        ),
      },
    })),
  combineDelta<Order, ReturnType<typeof getDelta>['0']>,
  combineInsertionData<Order>
);
