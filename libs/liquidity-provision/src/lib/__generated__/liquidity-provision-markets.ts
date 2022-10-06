/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, AuctionTrigger, MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: LiquidityProvisionMarkets
// ====================================================

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_data {
  __typename: "MarketData";
  /**
   * The amount of stake targeted for this market
   */
  targetStake: string | null;
  /**
   * What triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset {
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

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument {
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
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument_product;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument_instrument;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges_node {
  __typename: "LiquidityProvision";
  /**
   * Specified as a unit-less number that represents the amount of settlement asset of the market.
   */
  commitmentAmount: string;
  /**
   * Nominated liquidity fee factor, which is an input to the calculation of liquidity fees on the market, as per setting fees and rewarding liquidity providers.
   */
  fee: string;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges {
  __typename: "LiquidityProvisionsEdge";
  node: LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges_node;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection {
  __typename: "LiquidityProvisionsConnection";
  edges: (LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges | null)[] | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection_edges_node {
  __typename: "Candle";
  /**
   * High price (uint64)
   */
  high: string;
  /**
   * Low price (uint64)
   */
  low: string;
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

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection_edges {
  __typename: "CandleEdge";
  /**
   * The candle
   */
  node: LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection_edges_node;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection {
  __typename: "CandleDataConnection";
  /**
   * The candles
   */
  edges: (LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection_edges | null)[] | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * marketData for the given market
   */
  data: LiquidityProvisionMarkets_marketsConnection_edges_node_data | null;
  /**
   * The number of decimal places that an integer must be shifted by in order to get a correct
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
   * The number of decimal places that an integer must be shifted in order to get a correct size (uint64).
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
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: LiquidityProvisionMarkets_marketsConnection_edges_node_tradableInstrument;
  /**
   * The list of the liquidity provision commitments for this market
   */
  liquidityProvisionsConnection: LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection | null;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters using cursor based pagination
   */
  candlesConnection: LiquidityProvisionMarkets_marketsConnection_edges_node_candlesConnection | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges {
  __typename: "MarketEdge";
  /**
   * The market
   */
  node: LiquidityProvisionMarkets_marketsConnection_edges_node;
}

export interface LiquidityProvisionMarkets_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: LiquidityProvisionMarkets_marketsConnection_edges[];
}

export interface LiquidityProvisionMarkets {
  /**
   * One or more instruments that are trading on the Vega network
   */
  marketsConnection: LiquidityProvisionMarkets_marketsConnection | null;
}

export interface LiquidityProvisionMarketsVariables {
  interval: Interval;
  since: string;
}
