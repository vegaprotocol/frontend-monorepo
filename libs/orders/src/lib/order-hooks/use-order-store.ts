import { OrderTimeInForce, Side } from '@vegaprotocol/types';
import { OrderType } from '@vegaprotocol/types';
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

interface Store {
  orders: { [marketId: string]: OrderObj };
  update: (order: Partial<OrderObj> & { marketId: string }) => void;
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

export const createOrder = (marketId: string): OrderObj => ({
  marketId,
  type: OrderType.TYPE_MARKET,
  side: Side.SIDE_BUY,
  size: '',
  price: '',
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC,
  expiresAt: undefined,
});
