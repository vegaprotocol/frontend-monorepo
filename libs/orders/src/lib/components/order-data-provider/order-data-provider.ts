import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import type { Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import type { PageInfo, Edge, Cursor } from '@vegaprotocol/data-provider';
import { OrderStatus } from '@vegaprotocol/types';
import type {
  OrderFieldsFragment,
  OrderUpdateFieldsFragment,
  OrdersQuery,
  OrdersUpdateSubscription,
  OrdersQueryVariables,
  OrdersUpdateSubscriptionVariables,
} from './__generated__/Orders';
import { OrdersDocument, OrdersUpdateDocument } from './__generated__/Orders';
import type { ApolloClient } from '@apollo/client';

export type Order = Omit<OrderFieldsFragment, 'market'> & {
  market?: Market;
  isLastPlaceholder?: boolean;
};
export type OrderEdge = Edge<Order>;

const liveOnlyOrderStatuses = [
  OrderStatus.STATUS_ACTIVE,
  OrderStatus.STATUS_PARKED,
];

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
    variables?.filter?.liveOnly &&
    !(order.status && liveOnlyOrderStatuses.includes(order.status))
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
  if (variables?.filter?.excludeLiquidity && order.liquidityProvisionId) {
    return false;
  }
  if (
    variables?.filter?.dateRange?.start &&
    !(order.createdAt && variables.filter.dateRange.start < order.createdAt)
  ) {
    return false;
  }
  if (
    variables?.filter?.dateRange?.end &&
    !(order.createdAt && variables.filter.dateRange.end > order.createdAt)
  ) {
    return false;
  }

  return true;
};

export const mapOrderUpdateToOrder = (
  orderUpdate: OrderUpdateFieldsFragment
): OrderFieldsFragment => {
  const { marketId, liquidityProvisionId, ...order } = orderUpdate;
  // If there is a liquidity provision id add the object to the resulting order
  const liquidityProvision: OrderFieldsFragment['liquidityProvision'] | null =
    liquidityProvisionId
      ? {
          __typename: 'LiquidityProvision',
        }
      : null;
  return {
    ...order,
    liquidityProvision: liquidityProvision,
    market: {
      __typename: 'Market',
      id: marketId,
    },
    __typename: 'Order',
  };
};

const mapOrderUpdateToOrderWithMarket =
  (markets: Record<string, Market>) =>
  (orderUpdate: OrderUpdateFieldsFragment): Order => {
    const { market, ...order } = mapOrderUpdateToOrder(orderUpdate);
    return {
      ...order,
      market: markets[market.id],
    };
  };

const getData = (
  responseData: OrdersQuery | null
): (OrderFieldsFragment & Cursor)[] =>
  responseData?.party?.ordersConnection?.edges?.map<
    OrderFieldsFragment & Cursor
  >((edge) => ({ ...edge.node, cursor: edge.cursor })) || [];

export const filterOrderUpdates = (
  orders: OrdersUpdateSubscription['orders']
) => {
  // A single update can contain the same order with multiple updates, so we need to find
  // the latest version of the order and only update using that
  return orderBy(
    uniqBy(
      orderBy(orders, (order) => order.updatedAt || order.createdAt, 'desc'),
      'id'
    ),
    'createdAt'
  );
};

const getDelta = (
  subscriptionData: OrdersUpdateSubscription,
  variables: OrdersQueryVariables,
  client: ApolloClient<object>
) => {
  if (!subscriptionData.orders) {
    return [];
  }
  return filterOrderUpdates(subscriptionData.orders);
};

export const update = <T extends Omit<OrderFieldsFragment, 'market'> & Cursor>(
  data: T[] | null,
  delta: ReturnType<typeof getDelta>,
  variables: OrdersQueryVariables,
  mapDeltaToData: (delta: OrderUpdateFieldsFragment) => T
): T[] => {
  const updatedData = data ? [...data] : ([] as T[]);
  delta.forEach((orderUpdate) => {
    const index = data?.findIndex((order) => order.id === orderUpdate.id) ?? -1;
    const newer = !data?.length || orderUpdate.createdAt >= data[0].createdAt;
    const doesFilterPass =
      !variables || orderMatchFilters(orderUpdate, variables);
    if (index !== -1) {
      if (doesFilterPass) {
        updatedData[index] = {
          ...updatedData[index],
          ...mapDeltaToData(orderUpdate),
        };
      } else {
        updatedData.splice(index, 1);
      }
    } else if (newer && doesFilterPass) {
      updatedData.unshift(mapDeltaToData(orderUpdate));
    }
  });
  return updatedData;
};

const getPageInfo = (responseData: OrdersQuery): PageInfo | null =>
  responseData.party?.ordersConnection?.pageInfo || null;

export const ordersProvider = makeDataProvider<
  OrdersQuery,
  ReturnType<typeof getData>,
  OrdersUpdateSubscription,
  ReturnType<typeof getDelta>,
  OrdersQueryVariables,
  OrdersUpdateSubscriptionVariables
>({
  query: OrdersDocument,
  subscriptionQuery: OrdersUpdateDocument,
  update: (data, delta, reload, variables) =>
    update(data, delta, variables, mapOrderUpdateToOrder),
  getData,
  getDelta,
  pagination: {
    getPageInfo,
    append,
    first: 5000,
  },
  resetDelay: 1000,
  additionalContext: { isEnlargedTimeout: true },
  fetchPolicy: 'no-cache',
  getSubscriptionVariables: ({ partyId, marketIds }) => ({
    partyId,
    marketIds,
  }),
});

export const activeOrdersProvider = makeDerivedDataProvider<
  ReturnType<typeof getData>,
  never,
  { partyId: string; marketId?: string }
>(
  [
    (callback, client, variables) =>
      ordersProvider(callback, client, {
        partyId: variables.partyId,
        filter: {
          liveOnly: true,
        },
      }),
  ],
  (partsData, variables, prevData, parts, subscriptions) => {
    // load all pages
    if (!parts[0].isUpdate && subscriptions && subscriptions[0].load) {
      subscriptions[0].load();
    }
    const orders = partsData[0] as ReturnType<typeof getData>;
    return variables.marketId
      ? orders.filter((order) => variables.marketId === order.market.id)
      : orders;
  }
);

export const ordersWithMarketProvider = makeDerivedDataProvider<
  (Order & Cursor)[],
  never,
  OrdersQueryVariables
>(
  [
    ordersProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData, variables, prevData, parts): Order[] => {
    if (prevData && parts[0].isUpdate) {
      return update(
        prevData,
        parts[0].delta,
        variables,
        mapOrderUpdateToOrderWithMarket(partsData[1] as Record<string, Market>)
      );
    }
    return ((partsData[0] as ReturnType<typeof getData>) || []).map(
      (order) => ({
        ...order,
        market: (partsData[1] as Record<string, Market>)[order.market.id],
      })
    );
  }
);

export const hasActiveOrderProvider = makeDerivedDataProvider<
  boolean,
  never,
  { partyId: string; marketId?: string }
>([activeOrdersProvider], (parts) => !!parts[0].length);

export const hasAmendableOrderProvider = makeDerivedDataProvider<
  boolean,
  never,
  { partyId: string; marketId?: string }
>([activeOrdersProvider], (parts) => {
  const activeOrders = parts[0] as ReturnType<typeof getData>;
  const hasAmendableOrder = activeOrders.some(
    (order) => !(order.liquidityProvision || order.peggedOrder)
  );
  return hasAmendableOrder;
});
