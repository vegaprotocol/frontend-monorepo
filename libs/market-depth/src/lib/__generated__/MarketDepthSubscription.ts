/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: MarketDepthSubscription
// ====================================================

export interface MarketDepthSubscription_marketsDepthUpdate_sell {
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

export interface MarketDepthSubscription_marketsDepthUpdate_buy {
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

export interface MarketDepthSubscription_marketsDepthUpdate {
  __typename: "ObservableMarketDepthUpdate";
  /**
   * Market ID
   */
  marketId: string;
  /**
   * Sell side price levels (if available)
   */
  sell: MarketDepthSubscription_marketsDepthUpdate_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: MarketDepthSubscription_marketsDepthUpdate_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth. It is always increasing but not monotonic.
   */
  sequenceNumber: string;
  /**
   * Sequence number of the last update sent; useful for checking that no updates were missed.
   */
  previousSequenceNumber: string;
}

export interface MarketDepthSubscription {
  /**
   * Subscribe to price level market depth updates
   */
  marketsDepthUpdate: MarketDepthSubscription_marketsDepthUpdate[];
}

export interface MarketDepthSubscriptionVariables {
  id: string;
}
