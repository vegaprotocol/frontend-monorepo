/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PositionMetricsFields
// ====================================================

export interface PositionMetricsFields_market_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionMetricsFields_market_accounts_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface PositionMetricsFields_market_accounts {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Market (only relevant to margin accounts)
   */
  market: PositionMetricsFields_market_accounts_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: PositionMetricsFields_market_accounts_asset;
}

export interface PositionMetricsFields_market_data {
  __typename: "MarketData";
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
}

export interface PositionMetricsFields_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
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
   * Get account for a party or market
   */
  accounts: PositionMetricsFields_market_accounts[] | null;
  /**
   * marketData for the given market
   */
  data: PositionMetricsFields_market_data | null;
}

export interface PositionMetricsFields {
  __typename: "Position";
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Market relating to this position
   */
  market: PositionMetricsFields_market;
}
