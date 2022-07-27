/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, MarketState, MarketTradingMode, AuctionTrigger } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketList
// ====================================================

export interface MarketList_markets_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
}

export interface MarketList_markets_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: MarketList_markets_data_market;
  /**
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * what triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
}

export interface MarketList_markets_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketList_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface MarketList_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketList_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface MarketList_markets_tradableInstrument_instrument {
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
  metadata: MarketList_markets_tradableInstrument_instrument_metadata;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketList_markets_tradableInstrument_instrument_product;
}

export interface MarketList_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketList_markets_tradableInstrument_instrument;
}

export interface MarketList_markets_marketTimestamps {
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

export interface MarketList_markets_candles {
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

export interface MarketList_markets {
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
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * marketData for the given market
   */
  data: MarketList_markets_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketList_markets_tradableInstrument;
  /**
   * timestamps for state changes in the market
   */
  marketTimestamps: MarketList_markets_marketTimestamps;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by params
   */
  candles: (MarketList_markets_candles | null)[] | null;
}

export interface MarketList {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketList_markets[] | null;
}

export interface MarketListVariables {
  interval: Interval;
  since: string;
}
