import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { OrderTimeInForce, Side, OrderType } from '@vegaprotocol/types';

export interface StopOrderFormValues {
  side: Side;

  direction: 'fallsBelow' | 'risesAbove';

  trigger: 'price' | 'trailingPercentOffset';
  triggerPrice: string;
  triggerTrailingPercentOffset: string;

  type: OrderType;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;

  expire: boolean;
  expiryStrategy?: 'submit' | 'cancel';
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
