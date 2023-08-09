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
  triggerPrice?: string;
  triggerTrailingPercentOffset?: string;

  type: OrderType;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;

  expire: boolean;
  expiryStrategy?: Schema.StopOrderExpiryStrategy;
  expiresAt?: string;
}

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
  peakSize?: string;
  minimumVisibleSize?: string;
};

type UpdateOrder = (marketId: string, values: Partial<OrderFormValues>) => void;

type UpdateStopOrder = (
  marketId: string,
  values: Partial<StopOrderFormValues>
) => void;

type Store = {
  updateOrder: UpdateOrder;
  updateStopOrder: UpdateStopOrder;
  setType: (marketId: string, value: DealTicketType) => void;
  updateAll: (
    marketId: string,
    values: { size?: string; price?: string }
  ) => void;
  formValues: Record<
    string,
    | {
        [DealTicketType.Limit]?: Partial<OrderFormValues>;
        [DealTicketType.Market]?: Partial<OrderFormValues>;
        [DealTicketType.StopLimit]?: Partial<StopOrderFormValues>;
        [DealTicketType.StopMarket]?: Partial<StopOrderFormValues>;
        type?: DealTicketType;
      }
    | undefined
  >;
};

export const dealTicketTypeToOrderType = (dealTicketType?: DealTicketType) =>
  dealTicketType === DealTicketType.Limit ||
  dealTicketType === DealTicketType.StopLimit
    ? Schema.OrderType.TYPE_LIMIT
    : Schema.OrderType.TYPE_MARKET;

export const isStopOrderType = (dealTicketType?: DealTicketType) =>
  dealTicketType === DealTicketType.StopLimit ||
  dealTicketType === DealTicketType.StopMarket;

export const useDealTicketFormValues = create<Store>()(
  immer(
    persist(
      subscribeWithSelector((set) => ({
        formValues: {},
        updateStopOrder: (marketId, formValues) => {
          set((state) => {
            const type =
              formValues.type === Schema.OrderType.TYPE_LIMIT
                ? DealTicketType.StopLimit
                : DealTicketType.StopMarket;
            const market = state.formValues[marketId] || {};
            if (!state.formValues[marketId]) {
              state.formValues[marketId] = market;
            }
            market[type] = Object.assign(market[type] ?? {}, formValues);
          });
        },
        updateOrder: (marketId, formValues) => {
          set((state) => {
            const type =
              formValues.type === Schema.OrderType.TYPE_LIMIT
                ? DealTicketType.Limit
                : DealTicketType.Market;
            const market = state.formValues[marketId] || {};
            if (!state.formValues[marketId]) {
              state.formValues[marketId] = market;
            }
            market[type] = Object.assign(market[type] ?? {}, formValues);
          });
        },
        updateAll: (
          marketId: string,
          formValues: { size?: string; price?: string }
        ) => {
          set((state) => {
            const market = state.formValues[marketId] || {};
            if (!state.formValues[marketId]) {
              state.formValues[marketId] = market;
            }
            for (const type of Object.values(DealTicketType)) {
              market[type] = Object.assign(market[type] ?? {}, formValues);
            }
          });
        },
        setType: (marketId, type) => {
          set((state) => {
            state.formValues[marketId] = Object.assign(
              state.formValues[marketId] ?? {},
              { type }
            );
          });
        },
      })),
      {
        name: 'vega_deal_ticket_store',
      }
    )
  )
);
