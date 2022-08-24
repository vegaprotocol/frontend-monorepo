/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode, MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketsLanding
// ====================================================

export interface MarketsLanding_markets_marketTimestamps {
  __typename: "MarketTimestamps";
}

export interface MarketsLanding_markets {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * timestamps for state changes in the market
   */
  marketTimestamps: MarketsLanding_markets_marketTimestamps;
}

export interface MarketsLanding {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketsLanding_markets[] | null;
}
