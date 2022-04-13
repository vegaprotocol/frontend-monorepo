/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: MarketDepthUpdateSubscribe
// ====================================================

export interface MarketDepthUpdateSubscribe_marketDepthUpdate_market_data {
  __typename: "MarketData";
  /**
   * the arithmetic average of the best bid price and best offer price.
   */
  midPrice: string;
}

export interface MarketDepthUpdateSubscribe_marketDepthUpdate_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * marketData for the given market
   */
  data: MarketDepthUpdateSubscribe_marketDepthUpdate_market_data | null;
}

export interface MarketDepthUpdateSubscribe_marketDepthUpdate_sell {
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

export interface MarketDepthUpdateSubscribe_marketDepthUpdate_buy {
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

export interface MarketDepthUpdateSubscribe_marketDepthUpdate {
  __typename: "MarketDepthUpdate";
  /**
   * Market id
   */
  market: MarketDepthUpdateSubscribe_marketDepthUpdate_market;
  /**
   * Sell side price levels (if available)
   */
  sell: MarketDepthUpdateSubscribe_marketDepthUpdate_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: MarketDepthUpdateSubscribe_marketDepthUpdate_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface MarketDepthUpdateSubscribe {
  /**
   * Subscribe to price level market depth updates
   */
  marketDepthUpdate: MarketDepthUpdateSubscribe_marketDepthUpdate;
}

export interface MarketDepthUpdateSubscribeVariables {
  marketId: string;
}
