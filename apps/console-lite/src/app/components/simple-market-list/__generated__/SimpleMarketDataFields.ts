/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: SimpleMarketDataFields
// ====================================================

export interface SimpleMarketDataFields_market {
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

export interface SimpleMarketDataFields {
  __typename: "MarketData";
  /**
   * market of the associated mark price
   */
  market: SimpleMarketDataFields_market;
}
