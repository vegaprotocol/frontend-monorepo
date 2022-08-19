/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: PositionDetails
// ====================================================

export interface PositionDetails_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionDetails_market_data {
  __typename: "MarketData";
  /**
   * the mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * what state the market is in (auction, continuous, etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * market ID of the associated mark price
   */
  market: PositionDetails_market_data_market;
}

export interface PositionDetails_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
}

export interface PositionDetails_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: PositionDetails_market_tradableInstrument_instrument;
}

export interface PositionDetails_market {
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
   * marketData for the given market
   */
  data: PositionDetails_market_data | null;
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
   * positionDecimalPlaces indicates the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   * This sets how big the smallest order / position on the market can be.
   */
  positionDecimalPlaces: number;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: PositionDetails_market_tradableInstrument;
}

export interface PositionDetails {
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
   * Market relating to this position
   */
  market: PositionDetails_market;
}
