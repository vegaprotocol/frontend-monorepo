/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: marketDepthSubscribe
// ====================================================

export interface marketDepthSubscribe_marketDepth_sell {
  __typename: "PriceLevel";
  /**
   * The price of all the orders at this level (uint64)
   */
  price: string;
  /**
   * The total remaining size of all orders at this level (uint64)
   */
  volume: string;
  /**
   * The number of orders at this price level (uint64)
   */
  numberOfOrders: string;
}

export interface marketDepthSubscribe_marketDepth_buy {
  __typename: "PriceLevel";
  /**
   * The price of all the orders at this level (uint64)
   */
  price: string;
  /**
   * The total remaining size of all orders at this level (uint64)
   */
  volume: string;
  /**
   * The number of orders at this price level (uint64)
   */
  numberOfOrders: string;
}

export interface marketDepthSubscribe_marketDepth {
  __typename: "MarketDepth";
  /**
   * Sell side price levels (if available)
   */
  sell: marketDepthSubscribe_marketDepth_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: marketDepthSubscribe_marketDepth_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface marketDepthSubscribe {
  /**
   * Subscribe to the market depths update
   */
  marketDepth: marketDepthSubscribe_marketDepth;
}

export interface marketDepthSubscribeVariables {
  marketId: string;
}
