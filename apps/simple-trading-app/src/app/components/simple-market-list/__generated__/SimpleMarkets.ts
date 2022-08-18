/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: SimpleMarkets
// ====================================================

export interface SimpleMarkets_markets_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current state of the market
   */
  state: MarketState;
}

export interface SimpleMarkets_markets_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: SimpleMarkets_markets_data_market;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
  /**
   * The name of the asset (string)
   */
  settlementAsset: SimpleMarkets_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * Metadata for this instrument
   */
  metadata: SimpleMarkets_markets_tradableInstrument_instrument_metadata;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: SimpleMarkets_markets_tradableInstrument_instrument_product;
}

export interface SimpleMarkets_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: SimpleMarkets_markets_tradableInstrument_instrument;
}

export interface SimpleMarkets_markets_candles {
  __typename: "Candle";
  /**
   * Open price (uint64)
   */
  open: string;
  /**
   * Close price (uint64)
   */
  close: string;
}

export interface SimpleMarkets_markets {
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
   * marketData for the given market
   */
  data: SimpleMarkets_markets_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: SimpleMarkets_markets_tradableInstrument;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by params
   */
  candles: (SimpleMarkets_markets_candles | null)[] | null;
}

export interface SimpleMarkets {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: SimpleMarkets_markets[] | null;
}

export interface SimpleMarketsVariables {
  CandleSince: string;
}
