/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: PositionsMetrics
// ====================================================

export interface PositionsMetrics_party_accounts_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
}

export interface PositionsMetrics_party_accounts {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Asset, the 'currency'
   */
  asset: PositionsMetrics_party_accounts_asset;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface PositionsMetrics_party_marginsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionsMetrics_party_marginsConnection_edges_node {
  __typename: "MarginLevels";
  /**
   * market in which the margin is required for this party
   */
  market: PositionsMetrics_party_marginsConnection_edges_node_market;
  /**
   * minimal margin for the position to be maintained in the network (unsigned int actually)
   */
  maintenanceLevel: string;
  /**
   * if the margin is between maintenance and search, the network will initiate a collateral search (unsigned int actually)
   */
  searchLevel: string;
  /**
   * this is the minimal margin required for a party to place a new order on the network (unsigned int actually)
   */
  initialLevel: string;
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: string;
}

export interface PositionsMetrics_party_marginsConnection_edges {
  __typename: "MarginEdge";
  node: PositionsMetrics_party_marginsConnection_edges_node;
}

export interface PositionsMetrics_party_marginsConnection {
  __typename: "MarginConnection";
  /**
   * The margin levels in this connection
   */
  edges: PositionsMetrics_party_marginsConnection_edges[] | null;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: PositionsMetrics_party_positionsConnection_edges_node_market_tradableInstrument_instrument;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_accounts_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_accounts {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Market (only relevant to margin accounts)
   */
  market: PositionsMetrics_party_positionsConnection_edges_node_market_accounts_market | null;
  /**
   * Asset, the 'currency'
   */
  asset: PositionsMetrics_party_positionsConnection_edges_node_market_accounts_asset;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market_data {
  __typename: "MarketData";
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
}

export interface PositionsMetrics_party_positionsConnection_edges_node_market {
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
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: PositionsMetrics_party_positionsConnection_edges_node_market_tradableInstrument;
  /**
   * Get account for a party or market
   */
  accounts: PositionsMetrics_party_positionsConnection_edges_node_market_accounts[] | null;
  /**
   * marketData for the given market
   */
  data: PositionsMetrics_party_positionsConnection_edges_node_market_data | null;
}

export interface PositionsMetrics_party_positionsConnection_edges_node {
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
   * Market relating to this position
   */
  market: PositionsMetrics_party_positionsConnection_edges_node_market;
}

export interface PositionsMetrics_party_positionsConnection_edges {
  __typename: "PositionEdge";
  node: PositionsMetrics_party_positionsConnection_edges_node;
}

export interface PositionsMetrics_party_positionsConnection {
  __typename: "PositionConnection";
  /**
   * The positions in this connection
   */
  edges: PositionsMetrics_party_positionsConnection_edges[] | null;
}

export interface PositionsMetrics_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Collateral accounts relating to a party
   */
  accounts: PositionsMetrics_party_accounts[] | null;
  /**
   * Margin level for a market
   */
  marginsConnection: PositionsMetrics_party_marginsConnection;
  /**
   * Trading positions relating to a party
   */
  positionsConnection: PositionsMetrics_party_positionsConnection;
}

export interface PositionsMetrics {
  /**
   * An entity that is trading on the VEGA network
   */
  party: PositionsMetrics_party | null;
}

export interface PositionsMetricsVariables {
  partyId: string;
}
