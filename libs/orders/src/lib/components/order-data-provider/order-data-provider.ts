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
  OrderUpdateFieldsFragment,
  OrdersQuery,
  OrdersUpdateSubscription,
  OrdersQueryVariables,
} from './__generated__/Orders';
import { OrdersDocument, OrdersUpdateDocument } from './__generated__/Orders';

export type Order = Omit<OrderFieldsFragment, 'market'> & {
  market?: Market;
};
export type OrderEdge = Edge<Order>;

const orderMatchFilters = (
  order: OrderUpdateFieldsFragment,
  variables: OrdersQueryVariables
) => {
  if (!order) {
    return true;
  }
  if (
    variables?.filter?.status &&
    !(order.status && variables.filter.status.includes(order.status))
  ) {
    return false;
  }
  if (
    variables?.filter?.types &&
    !(order.type && variables.filter.types.includes(order.type))
  ) {
    return false;
  }
  if (
    variables?.filter?.timeInForce &&
    !variables.filter.timeInForce.includes(order.timeInForce)
  ) {
    return false;
  }
  if (
    variables?.dateRange?.start &&
    !(
      (order.updatedAt || order.createdAt) &&
      variables.dateRange.start < (order.updatedAt || order.createdAt)
    )
  ) {
    return false;
  }
  if (
    variables?.dateRange?.end &&
    !(
      (order.updatedAt || order.createdAt) &&
      variables.dateRange.end > (order.updatedAt || order.createdAt)
    )
  ) {
    return false;
  }
  return true;
};

const getData = (
  responseData: OrdersQuery | null
): Edge<OrderFieldsFragment>[] =>
  responseData?.party?.ordersConnection?.edges || [];

const getDelta = (subscriptionData: OrdersUpdateSubscription) =>
  subscriptionData.orders || [];

const getPageInfo = (responseData: OrdersQuery): PageInfo | null =>
  responseData.party?.ordersConnection?.pageInfo || null;

export const update = (
  data: ReturnType<typeof getData> | null,
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
      const doesFilterPass = !variables || orderMatchFilters(node, variables);
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
        });
      }
    });
  });
};

export const ordersProvider = makeDataProvider<
  OrdersQuery,
  ReturnType<typeof getData>,
  OrdersUpdateSubscription,
  ReturnType<typeof getDelta>,
  OrdersQueryVariables
>({
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
  additionalContext: { isEnlargedTimeout: true },
});

export const ordersWithMarketProvider = makeDerivedDataProvider<
  (OrderEdge | null)[],
  Order[],
  OrdersQueryVariables
>(
  [
    ordersProvider,
    (callback, client) => marketsProvider(callback, client, undefined),
  ],
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
