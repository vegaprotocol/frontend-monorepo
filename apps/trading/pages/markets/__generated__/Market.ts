/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Market
// ====================================================

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
