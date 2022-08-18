/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketNames
// ====================================================

export interface MarketNames_markets_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketNames_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
}

export interface MarketNames_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * Metadata for this instrument
   */
  metadata: MarketNames_markets_tradableInstrument_instrument_metadata;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketNames_markets_tradableInstrument_instrument_product;
}

export interface MarketNames_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketNames_markets_tradableInstrument_instrument;
}

export interface MarketNames_markets {
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketNames_markets_tradableInstrument;
}

export interface MarketNames {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketNames_markets[] | null;
}
