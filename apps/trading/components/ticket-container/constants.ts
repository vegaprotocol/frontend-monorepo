import { OrderTimeInForce } from '@vegaprotocol/types';

export const PERSISTENT_TIF_OPTIONS = [
  OrderTimeInForce.TIME_IN_FORCE_GTC,
  OrderTimeInForce.TIME_IN_FORCE_GTT,
  OrderTimeInForce.TIME_IN_FORCE_GFN,
  OrderTimeInForce.TIME_IN_FORCE_GFA,
];

export const NON_PERSISTENT_TIF_OPTIONS = [
  OrderTimeInForce.TIME_IN_FORCE_IOC,
  OrderTimeInForce.TIME_IN_FORCE_FOK,
];
