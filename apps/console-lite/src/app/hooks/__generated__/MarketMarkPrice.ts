/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MarketMarkPrice
// ====================================================

export interface MarketMarkPrice_market_data {
  __typename: "MarketData";
  /**
   * the mark price (an unsigned integer)
   */
  markPrice: string;
}

export interface MarketMarkPrice_market {
  __typename: "Market";
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the market. (uint64)
   * 
   * Examples:
   * Currency     Balance  decimalPlaces  Real Balance
   * GBP              100              0       GBP 100
   * GBP              100              2       GBP   1.00
   * GBP              100              4       GBP   0.01
   * GBP                1              4       GBP   0.0001   (  0.01p  )
   * 
   * GBX (pence)      100              0       GBP   1.00     (100p     )
   * GBX (pence)      100              2       GBP   0.01     (  1p     )
   * GBX (pence)      100              4       GBP   0.0001   (  0.01p  )
   * GBX (pence)        1              4       GBP   0.000001 (  0.0001p)
   */
  decimalPlaces: number;
  /**
   * marketData for the given market
   */
  data: MarketMarkPrice_market_data | null;
}

export interface MarketMarkPrice {
  /**
   * An instrument that is trading on the Vega network
   */
  market: MarketMarkPrice_market | null;
}

export interface MarketMarkPriceVariables {
  marketId: string;
}
