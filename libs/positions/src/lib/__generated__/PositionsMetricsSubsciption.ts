/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: PositionsMetricsSubsciption
// ====================================================

export interface PositionsMetricsSubsciption_positions_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface PositionsMetricsSubsciption_positions_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: PositionsMetricsSubsciption_positions_market_tradableInstrument_instrument;
}

export interface PositionsMetricsSubsciption_positions_market_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionsMetricsSubsciption_positions_market_accounts_asset {
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

export interface PositionsMetricsSubsciption_positions_market_accounts {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Market (only relevant to margin accounts)
   */
  market: PositionsMetricsSubsciption_positions_market_accounts_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: PositionsMetricsSubsciption_positions_market_accounts_asset;
}

export interface PositionsMetricsSubsciption_positions_market_data {
  __typename: "MarketData";
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
}

export interface PositionsMetricsSubsciption_positions_market {
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
   * positionDecimalPlaces indicated the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   */
  positionDecimalPlaces: number;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: PositionsMetricsSubsciption_positions_market_tradableInstrument;
  /**
   * Get account for a party or market
   */
  accounts: PositionsMetricsSubsciption_positions_market_accounts[] | null;
  /**
   * marketData for the given market
   */
  data: PositionsMetricsSubsciption_positions_market_data | null;
}

export interface PositionsMetricsSubsciption_positions {
  __typename: "Position";
  /**
   * Realised Profit and Loss (int64)
   */
  realisedPNL: string;
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Unrealised Profit and Loss (int64)
   */
  unrealisedPNL: string;
  /**
   * Average entry price for this position
   */
  averageEntryPrice: string;
  /**
   * RFC3339Nano time the position was updated
   */
  updatedAt: string | null;
  /**
   * Market relating to this position
   */
  market: PositionsMetricsSubsciption_positions_market;
}

export interface PositionsMetricsSubsciption {
  /**
   * Subscribe to the positions updates
   */
  positions: PositionsMetricsSubsciption_positions;
}

export interface PositionsMetricsSubsciptionVariables {
  partyId: string;
}
