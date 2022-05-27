import { OrderTimeInForce, OrderType, OrderSide } from '@vegaprotocol/wallet';
import { useState, useCallback } from 'react';
import type { DealTicketQuery_market } from './__generated__/DealTicketQuery';
import { addDecimal, toDecimal } from '@vegaprotocol/react-helpers';

export interface Order {
  size: string;
  type: OrderType;
  timeInForce: OrderTimeInForce;
  side: OrderSide | null;
  price?: string;
  expiration?: Date;
}

const getDefaultOrder = (market: DealTicketQuery_market, defaultOrder?: Order): Order => ({
  type: OrderType.Market,
  side: OrderSide.Buy,
  timeInForce: OrderTimeInForce.IOC,
  ...defaultOrder,
  size: defaultOrder?.size
    ? addDecimal(defaultOrder.size, market.positionDecimalPlaces)
    : String(toDecimal(market.positionDecimalPlaces)),
});

export type UpdateOrder = (order: Partial<Order>) => void;

export const useOrderState = (
  market: DealTicketQuery_market,
  defaultOrder?: Order,
): [Order, UpdateOrder] => {
  const [order, setOrder] = useState<Order>(getDefaultOrder(market, defaultOrder));

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
