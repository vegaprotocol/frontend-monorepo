/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Chart
// ====================================================

export interface Chart_market_data_priceMonitoringBounds {
  __typename: "PriceMonitoringBounds";
  /**
   * Minimum price that isn't currently breaching the specified price monitoring trigger
   */
  minValidPrice: string;
  /**
   * Maximum price that isn't currently breaching the specified price monitoring trigger
   */
  maxValidPrice: string;
  /**
   * Reference price used to calculate the valid price range
   */
  referencePrice: string;
}

export interface Chart_market_data {
  __typename: "MarketData";
  /**
   * A list of valid price ranges per associated trigger
   */
  priceMonitoringBounds: Chart_market_data_priceMonitoringBounds[] | null;
}

export interface Chart_market {
  __typename: "Market";
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market. (uint64)
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
  data: Chart_market_data | null;
}

export interface Chart {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: Chart_market | null;
}

export interface ChartVariables {
  marketId: string;
}
