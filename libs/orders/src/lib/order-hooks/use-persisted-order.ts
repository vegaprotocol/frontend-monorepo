import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import produce from 'immer';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import isEqual from 'lodash/isEqual';
import { useEffect } from 'react';

type OrderData = OrderSubmissionBody['orderSubmission'] | null;

type PersistedOrderStore = {
  orders: OrderData[];
  getOrder: (marketId: string) => OrderData | undefined;
  setOrder: (order: OrderData) => void;
  clear: () => void;
  updatePrice: (marketId: string, price: string) => void;
};

export const usePersistedOrderStore = create<PersistedOrderStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      orders: [],
      getOrder: (marketId: string) => {
        const current = get() as PersistedOrderStore;
        const persisted = current.orders.find((o) => o?.marketId === marketId);
        return persisted;
      },
      setOrder: (order: OrderData) => {
        console.log('persiting old');
        set(
          produce((store: PersistedOrderStore) => {
            const persisted = store.orders.find(
              (o) => o?.marketId === order?.marketId
            );
            if (persisted) {
              if (!isEqual(persisted, order)) {
                Object.assign(persisted, order);
              } else {
                // NOOP
              }
            } else {
              store.orders.push(order);
            }
          })
        );
      },
      clear: () => set({ orders: [] }),
      updatePrice: (marketId: string, price: string) =>
        set(
          produce((store: PersistedOrderStore) => {
            const persisted = store.orders.find(
              (o) => o?.marketId === marketId
            );
            if (persisted) {
              persisted.price = price;
            }
          })
        ),
    })),
    {
      name: 'VEGA_DEAL_TICKET_ORDER_STORE',
    }
  )
);

export const usePersistedOrderStoreSubscription = (
  marketId: string,
  onOrderChange: (order: NonNullable<OrderData>) => void
) => {
  const selector = (state: PersistedOrderStore) =>
    state.orders.find((o) => o?.marketId === marketId);
  const action = (storedOrder: OrderData | undefined) => {
    if (storedOrder) {
      onOrderChange(storedOrder);
    }
  };

  const unsubscribe = usePersistedOrderStore.subscribe(selector, action);
  useEffect(() => () => unsubscribe(), [unsubscribe]);
};
