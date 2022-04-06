/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: marketDepthUpdateSubscribe
// ====================================================

export interface marketDepthUpdateSubscribe_marketDepthUpdate_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface marketDepthUpdateSubscribe_marketDepthUpdate_sell {
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

export interface marketDepthUpdateSubscribe_marketDepthUpdate_buy {
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

export interface marketDepthUpdateSubscribe_marketDepthUpdate {
  __typename: "MarketDepthUpdate";
  /**
   * Market id
   */
  market: marketDepthUpdateSubscribe_marketDepthUpdate_market;
  /**
   * Sell side price levels (if available)
   */
  sell: marketDepthUpdateSubscribe_marketDepthUpdate_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: marketDepthUpdateSubscribe_marketDepthUpdate_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface marketDepthUpdateSubscribe {
  /**
   * Subscribe to price level market depth updates
   */
  marketDepthUpdate: marketDepthUpdateSubscribe_marketDepthUpdate;
}

export interface marketDepthUpdateSubscribeVariables {
  marketId: string;
}
