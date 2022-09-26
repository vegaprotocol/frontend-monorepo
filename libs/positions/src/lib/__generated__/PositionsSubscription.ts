/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: PositionsSubscription
// ====================================================

export interface PositionsSubscription_positions_marginsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionsSubscription_positions_marginsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface PositionsSubscription_positions_marginsConnection_edges_node {
  __typename: "MarginLevels";
  /**
   * Market in which the margin is required for this party
   */
  market: PositionsSubscription_positions_marginsConnection_edges_node_market;
  /**
   * Minimal margin for the position to be maintained in the network (unsigned integer)
   */
  maintenanceLevel: string;
  /**
   * If the margin is between maintenance and search, the network will initiate a collateral search (unsigned integer)
   */
  searchLevel: string;
  /**
   * This is the minimum margin required for a party to place a new order on the network (unsigned integer)
   */
  initialLevel: string;
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: string;
  /**
   * Asset for the current margins
   */
  asset: PositionsSubscription_positions_marginsConnection_edges_node_asset;
}

export interface PositionsSubscription_positions_marginsConnection_edges {
  __typename: "MarginEdge";
  node: PositionsSubscription_positions_marginsConnection_edges_node;
}

export interface PositionsSubscription_positions_marginsConnection {
  __typename: "MarginConnection";
  /**
   * The margin levels in this connection
   */
  edges: PositionsSubscription_positions_marginsConnection_edges[] | null;
}

export interface PositionsSubscription_positions_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface PositionsSubscription_positions_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: PositionsSubscription_positions_market_tradableInstrument_instrument;
}

export interface PositionsSubscription_positions_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionsSubscription_positions_market_data {
  __typename: "MarketData";
  /**
   * The mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * Market of the associated mark price
   */
  market: PositionsSubscription_positions_market_data_market;
}

export interface PositionsSubscription_positions_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
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
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: PositionsSubscription_positions_market_tradableInstrument;
  /**
   * marketData for the given market
   */
  data: PositionsSubscription_positions_market_data | null;
}

export interface PositionsSubscription_positions {
  __typename: "Position";
  /**
   * Realised Profit and Loss (int64)
   */
  realisedPNL: string;
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Unrealised Profit and Loss (int64)
   */
  unrealisedPNL: string;
  /**
   * Average entry price for this position
   */
  averageEntryPrice: string;
  /**
   * RFC3339Nano time the position was updated
   */
  updatedAt: string | null;
  /**
   * Margins of the party for the given position
   */
  marginsConnection: PositionsSubscription_positions_marginsConnection | null;
  /**
   * Market relating to this position
   */
  market: PositionsSubscription_positions_market;
}

export interface PositionsSubscription {
  /**
   * Subscribe to the positions updates
   */
  positions: PositionsSubscription_positions[];
}

export interface PositionsSubscriptionVariables {
  partyId: string;
}
