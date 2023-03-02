import { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface OrderObj {
  marketId: string;
  type: OrderType;
  side: Side;
  size: string;
  price: string;
  timeInForce: OrderTimeInForce;
  expiresAt: string | undefined;
}

type UpdateOrder = (order: Partial<OrderObj> & { marketId: string }) => void;

interface Store {
  orders: { [marketId: string]: OrderObj | undefined };
  update: UpdateOrder;
}

export const useOrderStore = create<Store>()(
  persist(
    subscribeWithSelector((set) => ({
      orders: {},
      update: (order) => {
        set((state) => {
          const curr = state.orders[order.marketId];
          return {
            orders: {
              ...state.orders,
              [order.marketId]: {
                ...curr,
                ...order,
              },
            },
          };
        });
      },
    })),
    {
      name: 'vega_order_store',
    }
  )
);

/**
 * Retrieves an order from the store and creates one if it doesn't
 * exist
 */
export const useOrder = (marketId: string) => {
  const [order, _update] = useOrderStore((store) => {
    return [store.orders[marketId], store.update];
  });

  const update = useCallback(
    (o: Partial<OrderObj>) => {
      _update({
        marketId,
        ...o,
      });
    },
    [marketId, _update]
  );

  // add new order to store if it doesn exist
  useEffect(() => {
    if (!order) {
      console.log('update here');
      update(createOrder(marketId));
    }
  }, [order, marketId, update]);

  return [order, update] as const; // make result a tuple
};

export const createOrder = (marketId: string): OrderObj => ({
  marketId,
  type: OrderType.TYPE_MARKET,
  side: Side.SIDE_BUY,
  size: '',
  price: '',
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  expiresAt: undefined,
});
