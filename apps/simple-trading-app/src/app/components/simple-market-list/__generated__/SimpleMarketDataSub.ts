/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState } from "@vegaprotocol/types";

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
}

export interface SimpleMarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketData: SimpleMarketDataSub_marketData;
}
