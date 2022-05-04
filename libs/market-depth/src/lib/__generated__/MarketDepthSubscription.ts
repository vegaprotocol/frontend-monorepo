/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: MarketDepthSubscription
// ====================================================

export interface MarketDepthSubscription_marketDepthUpdate_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketDepthSubscription_marketDepthUpdate_market_data {
  __typename: "MarketData";
  /**
   * the arithmetic average of the best bid price and best offer price.
   */
  midPrice: string;
  /**
   * market id of the associated mark price
   */
  market: MarketDepthSubscription_marketDepthUpdate_market_data_market;
}

export interface MarketDepthSubscription_marketDepthUpdate_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * marketData for the given market
   */
  data: MarketDepthSubscription_marketDepthUpdate_market_data | null;
}

export interface MarketDepthSubscription_marketDepthUpdate_sell {
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

export interface MarketDepthSubscription_marketDepthUpdate_buy {
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

export interface MarketDepthSubscription_marketDepthUpdate {
  __typename: "MarketDepthUpdate";
  /**
   * Market id
   */
  market: MarketDepthSubscription_marketDepthUpdate_market;
  /**
   * Sell side price levels (if available)
   */
  sell: MarketDepthSubscription_marketDepthUpdate_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: MarketDepthSubscription_marketDepthUpdate_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface MarketDepthSubscription {
  /**
   * Subscribe to price level market depth updates
   */
  marketDepthUpdate: MarketDepthSubscription_marketDepthUpdate;
}

export interface MarketDepthSubscriptionVariables {
  marketId: string;
}
