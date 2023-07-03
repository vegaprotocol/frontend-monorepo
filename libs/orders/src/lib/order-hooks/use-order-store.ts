import { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';
import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';

export type OrderObj = {
  marketId: string;
  type: OrderType;
  side: Side;
  size: string;
  timeInForce: OrderTimeInForce;
  price?: string;
  expiresAt?: string | undefined;
  persist: boolean; // key used to determine if order should be kept in localStorage
  postOnly?: boolean;
  reduceOnly?: boolean;
};
type OrderMap = { [marketId: string]: OrderObj | undefined };

type UpdateOrder = (
  marketId: string,
  order: Partial<OrderObj>,
  persist?: boolean
) => void;

interface Store {
  orders: OrderMap;
  update: UpdateOrder;
}

export const STORAGE_KEY = 'vega_order_store';

const orderStateCreator: StateCreator<Store> = (set) => ({
  orders: {},
  update: (marketId, order, persist = true) => {
    set((state) => {
      const curr = state.orders[marketId];
      const defaultOrder = getDefaultOrder(marketId);

      return {
        orders: {
          ...state.orders,
          [marketId]: {
            ...defaultOrder,
            ...curr,
            ...order,
            persist,
          },
        },
      };
    });
  },
});

export const useCreateOrderStore = () => {
  const useOrderStoreRef = useRef(
    create<Store>()(
      persist(subscribeWithSelector(orderStateCreator), {
        name: STORAGE_KEY,
        partialize: (state) => {
          // only store the order in localStorage if user has edited, this avoids
          // bloating localStorage if a user just visits the page but does not
          // edit the ticket
          const partializedOrders: OrderMap = {};
          for (const o in state.orders) {
            const order = state.orders[o];
            if (order && order.persist) {
              partializedOrders[order.marketId] = order;
            }
          }

          return {
            ...state,
            orders: partializedOrders,
          };
        },
      })
    )
  );
  return useOrderStoreRef.current;
};

/**
 * Retrieves an order from the store for a market and
 * creates one if it doesn't already exist
 */
export const useOrder = (marketId: string) => {
  const useOrderStoreRef = useCreateOrderStore();
  const [order, _update] = useOrderStoreRef((store) => {
    return [store.orders[marketId], store.update];
  });

  const update = useCallback(
    (o: Partial<OrderObj>, persist = true) => {
      _update(marketId, o, persist);
    },
    [marketId, _update]
  );

  // add new order to store if it doesnt exist, but don't
  // persist until user has edited
  useEffect(() => {
    if (!order) {
      update(
        getDefaultOrder(marketId),
        false // dont persist the order
      );
    }
  }, [order, marketId, update]);

  return [order, update] as const; // make result a tuple
};

export const getDefaultOrder = (marketId: string): OrderObj => ({
  marketId,
  type: OrderType.TYPE_LIMIT,
  side: Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
  size: '0',
  price: '0',
  expiresAt: undefined,
  persist: false,
  postOnly: false,
  reduceOnly: false,
});
