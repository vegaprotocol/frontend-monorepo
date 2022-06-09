/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, MarketTradingMode, MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Market
// ====================================================

export interface Market_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Market_market_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: Market_market_data_market;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * the aggregated volume being bid at the best bid price.
   */
  bestBidVolume: string;
  /**
   * the aggregated volume being offered at the best offer price.
   */
  bestOfferVolume: string;
  /**
   * the aggregated volume being offered at the best static bid price, excluding pegged orders
   */
  bestStaticBidVolume: string;
  /**
   * the aggregated volume being offered at the best static offer price, excluding pegged orders.
   */
  bestStaticOfferVolume: string;
}

export interface Market_market_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface Market_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * Metadata for this instrument
   */
  metadata: Market_market_tradableInstrument_instrument_metadata;
}

export interface Market_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: Market_market_tradableInstrument_instrument;
}

export interface Market_market_marketTimestamps {
  __typename: "MarketTimestamps";
  /**
   * Time when the market is open and ready to accept trades
   */
  open: string | null;
  /**
   * Time when the market is closed
   */
  close: string | null;
}

export interface Market_market_candles {
  __typename: "Candle";
  /**
   * Open price (uint64)
   */
  open: string;
  /**
   * Close price (uint64)
   */
  close: string;
  /**
   * Volume price (uint64)
   */
  volume: string;
}

export interface Market_market {
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
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Current state of the market
   */
  state: MarketState;
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
  data: Market_market_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: Market_market_tradableInstrument;
  /**
   * timestamps for state changes in the market
   */
  marketTimestamps: Market_market_marketTimestamps;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by params
   */
  candles: (Market_market_candles | null)[] | null;
}

export interface Market {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: Market_market | null;
}

export interface MarketVariables {
  marketId: string;
  interval: Interval;
  since: string;
}
