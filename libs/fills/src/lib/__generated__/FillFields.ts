/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Side } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: FillFields
// ====================================================

export interface FillFields_buyer {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface FillFields_seller {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface FillFields_buyerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the node runner to maintain the vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the market makers to provide liquidity in the market
   */
  liquidityFee: string;
}

export interface FillFields_sellerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the node runner to maintain the vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the market makers to provide liquidity in the market
   */
  liquidityFee: string;
}

export interface FillFields_market_tradableInstrument_instrument_product_settlementAsset {
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
   * The precision of the asset
   */
  decimals: number;
}

export interface FillFields_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: FillFields_market_tradableInstrument_instrument_product_settlementAsset;
}

export interface FillFields_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: FillFields_market_tradableInstrument_instrument_product;
}

export interface FillFields_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: FillFields_market_tradableInstrument_instrument;
}

export interface FillFields_market {
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: FillFields_market_tradableInstrument;
}

export interface FillFields {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * The order that bought
   */
  buyOrder: string;
  /**
   * The order that sold
   */
  sellOrder: string;
  /**
   * The aggressor indicates whether this trade was related to a BUY or SELL
   */
  aggressor: Side;
  /**
   * The party that bought
   */
  buyer: FillFields_buyer;
  /**
   * The party that sold
   */
  seller: FillFields_seller;
  /**
   * The fee paid by the buyer side of the trade
   */
  buyerFee: FillFields_buyerFee;
  /**
   * The fee paid by the seller side of the trade
   */
  sellerFee: FillFields_sellerFee;
  /**
   * The market the trade occurred on
   */
  market: FillFields_market;
}
