/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: MarketDataSub
// ====================================================

export interface MarketDataSub_marketData_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
}

export interface MarketDataSub_marketData {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: MarketDataSub_marketData_market;
  /**
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
}

export interface MarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketData: MarketDataSub_marketData;
}
