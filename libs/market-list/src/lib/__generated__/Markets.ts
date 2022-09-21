/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Markets
// ====================================================

export interface Markets_marketsConnection_edges_node_fees_factors {
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

export interface Markets_marketsConnection_edges_node_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: Markets_marketsConnection_edges_node_fees_factors;
}

export interface Markets_marketsConnection_edges_node_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface Markets_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
}

export interface Markets_marketsConnection_edges_node_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: Markets_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset;
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
}

export interface Markets_marketsConnection_edges_node_tradableInstrument_instrument {
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
  metadata: Markets_marketsConnection_edges_node_tradableInstrument_instrument_metadata;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: Markets_marketsConnection_edges_node_tradableInstrument_instrument_product;
}

export interface Markets_marketsConnection_edges_node_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: Markets_marketsConnection_edges_node_tradableInstrument_instrument;
}

export interface Markets_marketsConnection_edges_node_marketTimestamps {
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

export interface Markets_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
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
  fees: Markets_marketsConnection_edges_node_fees;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: Markets_marketsConnection_edges_node_tradableInstrument;
  /**
   * timestamps for state changes in the market
   */
  marketTimestamps: Markets_marketsConnection_edges_node_marketTimestamps;
}

export interface Markets_marketsConnection_edges {
  __typename: "MarketEdge";
  node: Markets_marketsConnection_edges_node;
}

export interface Markets_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: Markets_marketsConnection_edges[];
}

export interface Markets {
  marketsConnection: Markets_marketsConnection | null;
}
