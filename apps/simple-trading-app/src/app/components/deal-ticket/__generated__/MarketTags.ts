/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MarketTags
// ====================================================

export interface MarketTags_market_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketTags_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * Metadata for this instrument
   */
  metadata: MarketTags_market_tradableInstrument_instrument_metadata;
}

export interface MarketTags_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketTags_market_tradableInstrument_instrument;
}

export interface MarketTags_market {
  __typename: "Market";
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketTags_market_tradableInstrument;
}

export interface MarketTags {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: MarketTags_market | null;
}

export interface MarketTagsVariables {
  marketId: string;
}
