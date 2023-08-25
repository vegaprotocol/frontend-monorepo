import { OrderTimeInForce } from '@vegaprotocol/types';

export const isNonPersistentOrder = (timeInForce: OrderTimeInForce) => {
  return [
    OrderTimeInForce.TIME_IN_FORCE_FOK,
    OrderTimeInForce.TIME_IN_FORCE_IOC,
  ].includes(timeInForce);
};

export const isPersistentOrder = (timeInForce: OrderTimeInForce) => {
  return !isNonPersistentOrder(timeInForce);
};
