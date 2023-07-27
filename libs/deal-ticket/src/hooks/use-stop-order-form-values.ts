import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { OrderTimeInForce, Side, OrderType } from '@vegaprotocol/types';
import type * as Schema from '@vegaprotocol/types';

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

type Update = (
  marketId: string,
  formValues: Partial<StopOrderFormValues>,
  persist?: boolean
) => void;

interface Store {
  formValues: StopOrderFormValuesMap;
  update: Update;
}

export const useStopOrderFormValues = create<Store>()(
  persist(
    subscribeWithSelector((set) => ({
      formValues: {},
      update: (marketId, formValues, persist = true) => {
        set((state) => {
          return {
            formValues: {
              ...state.formValues,
              [marketId]: {
                ...state.formValues[marketId],
                ...formValues,
              },
            },
          };
        });
      },
    })),
    {
      name: 'vega_stop_order_store',
    }
  )
);
