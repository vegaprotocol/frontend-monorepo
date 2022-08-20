/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: PartyMarketData
// ====================================================

export interface PartyMarketData_party_accounts_asset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
}

export interface PartyMarketData_party_accounts_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PartyMarketData_party_accounts {
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
  asset: PartyMarketData_party_accounts_asset;
  /**
   * Market (only relevant to margin accounts)
   */
  market: PartyMarketData_party_accounts_market | null;
}

export interface PartyMarketData_party_marginsConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PartyMarketData_party_marginsConnection_edges_node {
  __typename: "MarginLevels";
  /**
   * market in which the margin is required for this party
   */
  market: PartyMarketData_party_marginsConnection_edges_node_market;
  /**
   * this is the minimum margin required for a party to place a new order on the network (unsigned integer)
   */
  initialLevel: string;
  /**
   * minimal margin for the position to be maintained in the network (unsigned integer)
   */
  maintenanceLevel: string;
  /**
   * if the margin is between maintenance and search, the network will initiate a collateral search (unsigned integer)
   */
  searchLevel: string;
}

export interface PartyMarketData_party_marginsConnection_edges {
  __typename: "MarginEdge";
  node: PartyMarketData_party_marginsConnection_edges_node;
}

export interface PartyMarketData_party_marginsConnection {
  __typename: "MarginConnection";
  /**
   * The margin levels in this connection
   */
  edges: PartyMarketData_party_marginsConnection_edges[] | null;
}

export interface PartyMarketData_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Collateral accounts relating to a party
   */
  accounts: PartyMarketData_party_accounts[] | null;
  /**
   * Margin levels for a market
   */
  marginsConnection: PartyMarketData_party_marginsConnection;
}

export interface PartyMarketData {
  /**
   * An entity that is trading on the Vega network
   */
  party: PartyMarketData_party | null;
}

export interface PartyMarketDataVariables {
  partyId: string;
}
