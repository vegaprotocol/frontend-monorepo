import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import produce from 'immer';
import create from 'zustand';
import { persist } from 'zustand/middleware';

type OrderData = OrderSubmissionBody['orderSubmission'] | null;

type PersistedOrderStore = {
  orders: OrderData[];
  getOrder: (marketId: string) => OrderData | undefined;
  setOrder: (order: OrderData) => void;
  clear: () => void;
};

export const usePersistedOrderStore = create(
  persist<PersistedOrderStore>(
    (set, get) => ({
      orders: [],
      getOrder: (marketId) => {
        const persisted = get().orders.find((o) => o?.marketId === marketId);
        return persisted;
      },
      setOrder: (order) => {
        set(
          produce((store: PersistedOrderStore) => {
            const persisted = store.orders.find(
              (o) => o?.marketId === order?.marketId
            );
            if (persisted) {
              Object.assign(persisted, order);
            } else {
              store.orders.push(order);
            }
          })
        );
      },
      clear: () => set({ orders: [] }),
    }),
    {
      name: 'VEGA_DEAL_TICKET_ORDER_STORE',
    }
  )
);
