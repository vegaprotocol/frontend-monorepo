/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: SimpleMarketDataSub
// ====================================================

export interface SimpleMarketDataSub_marketData_market {
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

export interface SimpleMarketDataSub_marketData {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: SimpleMarketDataSub_marketData_market;
  /**
   * RFC3339Nano time at which the auction will stop (null if not in auction mode)
   */
  auctionEnd: string | null;
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

export interface SimpleMarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketData: SimpleMarketDataSub_marketData;
}
