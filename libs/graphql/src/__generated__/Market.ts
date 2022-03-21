/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: Market
// ====================================================

export interface Market_market_tradableInstrument_instrument_product_settlementAsset {
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
}

export interface Market_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
  /**
   * The name of the asset (string)
   */
  settlementAsset: Market_market_tradableInstrument_instrument_product_settlementAsset;
}

export interface Market_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: Market_market_tradableInstrument_instrument_product;
}

export interface Market_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: Market_market_tradableInstrument_instrument;
}

export interface Market_market_trades {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
}

export interface Market_market_depth_lastTrade {
  __typename: "Trade";
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
}

export interface Market_market_depth {
  __typename: "MarketDepth";
  /**
   * Last trade for the given market (if available)
   */
  lastTrade: Market_market_depth_lastTrade | null;
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: Market_market_tradableInstrument;
  /**
   * Trades on a market
   */
  trades: Market_market_trades[] | null;
  /**
   * Current depth on the order book for this market
   */
  depth: Market_market_depth;
}

export interface Market {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: Market_market | null;
}

export interface MarketVariables {
  marketId: string;
}
