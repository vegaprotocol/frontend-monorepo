/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketPositions
// ====================================================

export interface MarketPositions_party_accounts_asset {
  __typename: "Asset";
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface MarketPositions_party_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketPositions_party_accounts {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Asset, the 'currency'
   */
  asset: MarketPositions_party_accounts_asset;
  /**
   * Market (only relevant to margin accounts)
   */
  market: MarketPositions_party_accounts_market | null;
}

export interface MarketPositions_party_positionsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketPositions_party_positionsConnection_edges_node {
  __typename: "Position";
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Market relating to this position
   */
  market: MarketPositions_party_positionsConnection_edges_node_market;
}

export interface MarketPositions_party_positionsConnection_edges {
  __typename: "PositionEdge";
  node: MarketPositions_party_positionsConnection_edges_node;
}

export interface MarketPositions_party_positionsConnection {
  __typename: "PositionConnection";
  /**
   * The positions in this connection
   */
  edges: MarketPositions_party_positionsConnection_edges[] | null;
}

export interface MarketPositions_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Collateral accounts relating to a party
   */
  accounts: MarketPositions_party_accounts[] | null;
  /**
   * Trading positions relating to a party
   */
  positionsConnection: MarketPositions_party_positionsConnection;
}

export interface MarketPositions {
  /**
   * An entity that is trading on the VEGA network
   */
  party: MarketPositions_party | null;
}

export interface MarketPositionsVariables {
  partyId: string;
}
