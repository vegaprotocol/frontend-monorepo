/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Positions
// ====================================================

export interface Positions_party_positionsConnection_edges_node_marginsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Positions_party_positionsConnection_edges_node_marginsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface Positions_party_positionsConnection_edges_node_marginsConnection_edges_node {
  __typename: "MarginLevels";
  /**
   * market in which the margin is required for this party
   */
  market: Positions_party_positionsConnection_edges_node_marginsConnection_edges_node_market;
  /**
   * minimal margin for the position to be maintained in the network (unsigned integer)
   */
  maintenanceLevel: string;
  /**
   * if the margin is between maintenance and search, the network will initiate a collateral search (unsigned integer)
   */
  searchLevel: string;
  /**
   * this is the minimum margin required for a party to place a new order on the network (unsigned integer)
   */
  initialLevel: string;
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: string;
  /**
   * asset for the current margins
   */
  asset: Positions_party_positionsConnection_edges_node_marginsConnection_edges_node_asset;
}

export interface Positions_party_positionsConnection_edges_node_marginsConnection_edges {
  __typename: "MarginEdge";
  node: Positions_party_positionsConnection_edges_node_marginsConnection_edges_node;
}

export interface Positions_party_positionsConnection_edges_node_marginsConnection {
  __typename: "MarginConnection";
  /**
   * The margin levels in this connection
   */
  edges: Positions_party_positionsConnection_edges_node_marginsConnection_edges[] | null;
}

export interface Positions_party_positionsConnection_edges_node_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface Positions_party_positionsConnection_edges_node_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: Positions_party_positionsConnection_edges_node_market_tradableInstrument_instrument;
}

export interface Positions_party_positionsConnection_edges_node_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Positions_party_positionsConnection_edges_node_market_data {
  __typename: "MarketData";
  /**
   * the mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * market of the associated mark price
   */
  market: Positions_party_positionsConnection_edges_node_market_data_market;
}

export interface Positions_party_positionsConnection_edges_node_market {
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
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: Positions_party_positionsConnection_edges_node_market_tradableInstrument;
  /**
   * marketData for the given market
   */
  data: Positions_party_positionsConnection_edges_node_market_data | null;
}

export interface Positions_party_positionsConnection_edges_node {
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
  marginsConnection: Positions_party_positionsConnection_edges_node_marginsConnection | null;
  /**
   * Market relating to this position
   */
  market: Positions_party_positionsConnection_edges_node_market;
}

export interface Positions_party_positionsConnection_edges {
  __typename: "PositionEdge";
  node: Positions_party_positionsConnection_edges_node;
}

export interface Positions_party_positionsConnection {
  __typename: "PositionConnection";
  /**
   * The positions in this connection
   */
  edges: Positions_party_positionsConnection_edges[] | null;
}

export interface Positions_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Trading positions relating to a party
   */
  positionsConnection: Positions_party_positionsConnection | null;
}

export interface Positions {
  /**
   * An entity that is trading on the Vega network
   */
  party: Positions_party | null;
}

export interface PositionsVariables {
  partyId: string;
}
