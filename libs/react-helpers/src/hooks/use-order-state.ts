import { useState, useCallback } from 'react';

export enum OrderType {
  Market = 'TYPE_MARKET',
  Limit = 'TYPE_LIMIT',
}

export enum OrderSide {
  Buy = 'SIDE_BUY',
  Sell = 'SIDE_SELL',
}

export enum OrderTimeInForce {
  GTC = 'TIME_IN_FORCE_GTC',
  GTT = 'TIME_IN_FORCE_GTT',
  IOC = 'TIME_IN_FORCE_IOC',
  FOK = 'TIME_IN_FORCE_FOK',
  GFN = 'TIME_IN_FORCE_GFN',
  GFA = 'TIME_IN_FORCE_GFA',
}

export interface Order {
  size: string;
  type: OrderType;
  timeInForce: OrderTimeInForce;
  side: OrderSide | null;
  price?: string;
  expiration?: Date;
}

export type UpdateOrder = (order: Partial<Order>) => void;

export const useOrderState = (defaultOrder: Order): [Order, UpdateOrder] => {
  const [order, setOrder] = useState<Order>(defaultOrder);

  const updateOrder = useCallback((orderUpdate: Partial<Order>) => {
    setOrder((curr) => {
      // Type is switching to market so return new market order object with correct defaults
      if (
        orderUpdate.type === OrderType.Market &&
        curr.type !== OrderType.Market
      ) {
        // Check if provided TIF or current TIF is valid for a market order and default
        // to IOC if its not

        const isTifValid = (tif: OrderTimeInForce) => {
          return tif === OrderTimeInForce.FOK || tif === OrderTimeInForce.IOC;
        };

        // Default
        let timeInForce = OrderTimeInForce.IOC;

        if (orderUpdate.timeInForce) {
          if (isTifValid(orderUpdate.timeInForce)) {
            timeInForce = orderUpdate.timeInForce;
          }
        } else {
          if (isTifValid(curr.timeInForce)) {
            timeInForce = curr.timeInForce;
          }
        }

        return {
          type: orderUpdate.type,
          size: orderUpdate.size || curr.size,
          side: orderUpdate.side || curr.side,
          timeInForce,
          price: undefined,
          expiration: undefined,
        };
      }

      // Type is switching to limit so return new order object with correct defaults
      if (
        orderUpdate.type === OrderType.Limit &&
        curr.type !== OrderType.Limit
      ) {
        return {
          type: orderUpdate.type,
          size: orderUpdate.size || curr.size,
          side: orderUpdate.side || curr.side,
          timeInForce: orderUpdate.timeInForce || curr.timeInForce,
          price: orderUpdate.price || '0',
          expiration: orderUpdate.expiration || undefined,
        };
      }

      return {
        ...curr,
        ...orderUpdate,
      };
    });
  }, []);

  return [order, updateOrder];
};
