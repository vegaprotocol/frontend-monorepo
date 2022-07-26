/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: marketPositions
// ====================================================

export interface marketPositions_party_positionsConnection_edges_node_market_accounts {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface marketPositions_party_positionsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Get account for a party or market
   */
  accounts: marketPositions_party_positionsConnection_edges_node_market_accounts[] | null;
}

export interface marketPositions_party_positionsConnection_edges_node {
  __typename: "Position";
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Market relating to this position
   */
  market: marketPositions_party_positionsConnection_edges_node_market;
}

export interface marketPositions_party_positionsConnection_edges {
  __typename: "PositionEdge";
  node: marketPositions_party_positionsConnection_edges_node;
}

export interface marketPositions_party_positionsConnection {
  __typename: "PositionConnection";
  /**
   * The positions in this connection
   */
  edges: marketPositions_party_positionsConnection_edges[] | null;
}

export interface marketPositions_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Trading positions relating to a party
   */
  positionsConnection: marketPositions_party_positionsConnection;
}

export interface marketPositions {
  /**
   * An entity that is trading on the VEGA network
   */
  party: marketPositions_party | null;
}

export interface marketPositionsVariables {
  partyId: string;
}
