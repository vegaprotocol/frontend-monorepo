/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Positions
// ====================================================

export interface Positions_party_positionsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
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
   * Market relating to this position
   */
  market: Positions_party_positionsConnection_edges_node_market;
}

export interface Positions_party_positionsConnection_edges {
  __typename: "PositionEdge";
  /**
   * The position
   */
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
