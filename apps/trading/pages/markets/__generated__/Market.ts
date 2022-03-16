/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Market
// ====================================================

export interface Market_market_trades {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
}

export interface Market_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Market full name
   */
  name: string;
  /**
   * Trades on a market
   */
  trades: Market_market_trades[] | null;
}

export interface Market {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: Market_market | null;
}

export interface MarketVariables {
  marketId: string;
}
