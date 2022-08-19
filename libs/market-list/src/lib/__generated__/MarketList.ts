/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, MarketState, MarketTradingMode, AuctionTrigger } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketList
// ====================================================

export interface MarketList_markets_fees_factors {
  __typename: "FeeFactors";
  /**
   * The factor applied to calculate MakerFees, a non-negative float
   */
  makerFee: string;
  /**
   * The factor applied to calculate InfrastructureFees, a non-negative float
   */
  infrastructureFee: string;
  /**
   * The factor applied to calculate LiquidityFees, a non-negative float
   */
  liquidityFee: string;
}

export interface MarketList_markets_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: MarketList_markets_fees_factors;
}

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
   * market ID of the associated mark price
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
   * the mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * what triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
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
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
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
   * An instance of, or reference to, a fully specified instrument.
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
  /**
   * High price (uint64)
   */
  high: string;
  /**
   * Low price (uint64)
   */
  low: string;
}

export interface MarketList_markets {
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
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Fees related data
   */
  fees: MarketList_markets_fees;
  /**
   * marketData for the given market
   */
  data: MarketList_markets_data | null;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: MarketList_markets_tradableInstrument;
  /**
   * timestamps for state changes in the market
   */
  marketTimestamps: MarketList_markets_marketTimestamps;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters
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
