import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { OrderTimeInForce, Side, OrderType } from '@vegaprotocol/types';
import * as Schema from '@vegaprotocol/types';
import { immer } from 'zustand/middleware/immer';

export enum DealTicketType {
  Limit = 'Limit',
  Market = 'Market',
  StopLimit = 'StopLimit',
  StopMarket = 'StopMarket',
}

export interface StopOrderFormValues {
  side: Side;

  triggerDirection: Schema.StopOrderTriggerDirection;

  triggerType: 'price' | 'trailingPercentOffset';
  triggerPrice: string;
  triggerTrailingPercentOffset: string;

  type: OrderType;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;

  expire: boolean;
  expiryStrategy?: Schema.StopOrderExpiryStrategy;
  expiresAt?: string;
}

type StopOrderFormValuesMap = {
  [marketId: string]: Partial<StopOrderFormValues> | undefined;
};

export type OrderFormValues = {
  type: OrderType;
  side: Side;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;
  expiresAt?: string | undefined;
  postOnly?: boolean;
  reduceOnly?: boolean;
  iceberg?: boolean;
  icebergOpts?: {
    peakSize?: string;
    minimumVisibleSize?: string;
  };
};

type OrdersMap = { [marketId: string]: Partial<OrderFormValues> | undefined };
type UpdateOrder = (marketId: string, values: Partial<OrderFormValues>) => void;

type UpdateStopOrder = (
  marketId: string,
  values: Partial<StopOrderFormValues>
) => void;

interface Store {
  orders: OrdersMap;
  updateOrder: UpdateOrder;
  stopOrders: StopOrderFormValuesMap;
  updateStopOrder: UpdateStopOrder;
  setType: (marketId: string, value: DealTicketType) => void;
  update: (marketId: string, values: { size?: string; price?: string }) => void;
  showStopOrder: Record<string, boolean>;
}

export const dealTicketTypeToOrderType = (dealTicketType: DealTicketType) =>
  dealTicketType === DealTicketType.Limit ||
  dealTicketType === DealTicketType.StopLimit
    ? Schema.OrderType.TYPE_LIMIT
    : Schema.OrderType.TYPE_MARKET;

export const isStopOrderType = (dealTicketType: DealTicketType) =>
  dealTicketType === DealTicketType.StopLimit ||
  dealTicketType === DealTicketType.StopMarket;

export const useDealTicketFormValues = create<Store>()(
  immer(
    persist(
      subscribeWithSelector((set) => ({
        showStopOrder: {},
        activeForm: {},
        orders: {},
        stopOrders: {},
        updateStopOrder: (marketId, formValues) => {
          set((state) => {
            state.stopOrders[marketId] = Object.assign(
              state.stopOrders[marketId] ?? {},
              formValues
            );
          });
        },
        updateOrder: (marketId, formValues) => {
          set((state) => {
            state.orders[marketId] = Object.assign(
              state.orders[marketId] ?? {},
              formValues
            );
          });
        },
        update: (
          marketId: string,
          values: { size?: string; price?: string }
        ) => {
          set((state) => {
            state.stopOrders[marketId] = Object.assign(
              state.stopOrders[marketId] ?? {},
              values
            );
            state.orders[marketId] = Object.assign(
              state.orders[marketId] ?? {},
              values
            );
          });
        },
        setType: (marketId, dealTicketType) => {
          set((state) => {
            const showStopOrder = isStopOrderType(dealTicketType);
            const type = dealTicketTypeToOrderType(dealTicketType);
            state.showStopOrder[marketId] = showStopOrder;
            if (showStopOrder) {
              state.stopOrders[marketId] = Object.assign(
                state.stopOrders[marketId] ?? {},
                { type }
              );
            } else {
              state.orders[marketId] = Object.assign(
                state.orders[marketId] ?? {},
                { type }
              );
            }
          });
        },
      })),
      {
        name: 'deal-ticket-form-values',
      }
    )
  )
);
