/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: Markets
// ====================================================

export interface Markets_markets {
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
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
}

export interface Markets {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: Markets_markets[] | null;
}
