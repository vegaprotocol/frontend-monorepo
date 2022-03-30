/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: Positions
// ====================================================

export interface Positions_party_positions_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Positions_party_positions_market_data {
  __typename: "MarketData";
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * what state the market is in (auction, continuous etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * market id of the associated mark price
   */
  market: Positions_party_positions_market_data_market;
}

export interface Positions_party_positions_market_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface Positions_party_positions_market_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface Positions_party_positions_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: Positions_party_positions_market_tradableInstrument_instrument_product_settlementAsset;
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
}

export interface Positions_party_positions_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * Metadata for this instrument
   */
  metadata: Positions_party_positions_market_tradableInstrument_instrument_metadata;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: Positions_party_positions_market_tradableInstrument_instrument_product;
}

export interface Positions_party_positions_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: Positions_party_positions_market_tradableInstrument_instrument;
}

export interface Positions_party_positions_market {
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
  data: Positions_party_positions_market_data | null;
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: Positions_party_positions_market_tradableInstrument;
}

export interface Positions_party_positions {
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
  market: Positions_party_positions_market;
}

export interface Positions_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Trading positions relating to a party
   */
  positions: Positions_party_positions[] | null;
}

export interface Positions {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Positions_party | null;
}

export interface PositionsVariables {
  partyId: string;
}
