import { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';
import { toDecimal } from '@vegaprotocol/utils';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export type OrderObj = {
  marketId: string;
  type?: OrderType;
  side?: Side;
  size?: string;
  price?: string;
  timeInForce?: OrderTimeInForce;
  expiresAt?: string | undefined;
  persist: boolean;
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

export const useOrderStore = create<Store>()(
  persist(
    subscribeWithSelector((set) => ({
      orders: {},
      update: (marketId, order, persist = true) => {
        set((state) => {
          const curr = state.orders[marketId];
          return {
            orders: {
              ...state.orders,
              [marketId]: {
                ...curr,
                ...order,
                marketId,
                persist, // persist the order if updated
              },
            },
          };
        });
      },
    })),
    {
      name: 'vega_order_store',
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
    }
  )
);

/**
 * Retrieves an order from the store and creates one if it doesn't
 * exist
 */
export const useOrder = (market: {
  id: string;
  positionDecimalPlaces: number;
}) => {
  const [order, _update] = useOrderStore((store) => {
    return [store.orders[market.id], store.update];
  });

  const update = useCallback(
    (o: Partial<OrderObj>, persist = true) => {
      _update(market.id, o, persist);
    },
    [market.id, _update]
  );

  // add new order to store if it doesnt exist, but don't
  // persist until user has edited
  useEffect(() => {
    if (!order) {
      update(getDefaultOrder(market), false);
    }
  }, [order, market, update]);

  return [order, update] as const; // make result a tuple
};

export const getDefaultOrder = (market: {
  id: string;
  positionDecimalPlaces: number;
}): OrderObj => ({
  marketId: market.id,
  type: OrderType.TYPE_MARKET,
  side: Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  size: String(toDecimal(market.positionDecimalPlaces)),
  price: '0',
  expiresAt: undefined,
  persist: false,
});
