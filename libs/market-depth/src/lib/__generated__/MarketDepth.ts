/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MarketDepth
// ====================================================

export interface MarketDepth_market_depth_sell {
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

export interface MarketDepth_market_depth_buy {
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

export interface MarketDepth_market_depth {
  __typename: "MarketDepth";
  /**
   * Sell side price levels (if available)
   */
  sell: MarketDepth_market_depth_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: MarketDepth_market_depth_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface MarketDepth_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current depth on the order book for this market
   */
  depth: MarketDepth_market_depth;
}

export interface MarketDepth {
  /**
   * An instrument that is trading on the Vega network
   */
  market: MarketDepth_market | null;
}

export interface MarketDepthVariables {
  marketId: string;
}
