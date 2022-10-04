/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Margins
// ====================================================

export interface Margins_party_marginsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Margins_party_marginsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
}

export interface Margins_party_marginsConnection_edges_node {
  __typename: "MarginLevels";
  /**
   * Market in which the margin is required for this party
   */
  market: Margins_party_marginsConnection_edges_node_market;
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
  asset: Margins_party_marginsConnection_edges_node_asset;
}

export interface Margins_party_marginsConnection_edges {
  __typename: "MarginEdge";
  node: Margins_party_marginsConnection_edges_node;
}

export interface Margins_party_marginsConnection {
  __typename: "MarginConnection";
  /**
   * The margin levels in this connection
   */
  edges: Margins_party_marginsConnection_edges[] | null;
}

export interface Margins_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Margin levels for a market
   */
  marginsConnection: Margins_party_marginsConnection | null;
}

export interface Margins {
  /**
   * An entity that is trading on the Vega network
   */
  party: Margins_party | null;
}

export interface MarginsVariables {
  partyId: string;
}
