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

export interface OrderSubmission {
  pubKey: string;
  propagate: boolean;
  orderSubmission: {
    marketId: string;
    size: string;
    type: OrderType;
    side: OrderSide;
    timeInForce: OrderTimeInForce;
    price?: string;
    expiresAt?: string;
    reference?: string;
  };
}

// Will make Transaction a union type as other transactions are added
export type Transaction = OrderSubmission;
