/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: PartyAssetsQuery
// ====================================================

export interface PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges_node_node {
  __typename: "Node";
  /**
   * The node URL eg n01.vega.xyz
   */
  id: string;
  name: string;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges_node {
  __typename: "Delegation";
  /**
   * Amount delegated
   */
  amount: string;
  /**
   * URL of node you are delegating to
   */
  node: PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges_node_node;
  /**
   * Epoch of delegation
   */
  epoch: number;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges {
  __typename: "DelegationEdge";
  /**
   * The delegation information
   */
  node: PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges_node;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection {
  __typename: "DelegationsConnection";
  /**
   * The delegation information available on this connection
   */
  edges: (PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection_edges | null)[] | null;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export type PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source = PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source_BuiltinAsset | PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source_ERC20;

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The origin source of the asset (e.g: an ERC20 asset)
   */
  source: PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset_source;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node {
  __typename: "AccountBalance";
  /**
   * Asset, the 'currency'
   */
  asset: PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node_asset;
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges {
  __typename: "AccountEdge";
  /**
   * The account
   */
  node: PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges_node;
}

export interface PartyAssetsQuery_partiesConnection_edges_node_accountsConnection {
  __typename: "AccountsConnection";
  /**
   * List of accounts available for the connection
   */
  edges: (PartyAssetsQuery_partiesConnection_edges_node_accountsConnection_edges | null)[] | null;
}

export interface PartyAssetsQuery_partiesConnection_edges_node {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  delegationsConnection: PartyAssetsQuery_partiesConnection_edges_node_delegationsConnection | null;
  /**
   * The staking information for this Party
   */
  stakingSummary: PartyAssetsQuery_partiesConnection_edges_node_stakingSummary;
  /**
   * Collateral accounts relating to a party
   */
  accountsConnection: PartyAssetsQuery_partiesConnection_edges_node_accountsConnection | null;
}

export interface PartyAssetsQuery_partiesConnection_edges {
  __typename: "PartyEdge";
  /**
   * The party
   */
  node: PartyAssetsQuery_partiesConnection_edges_node;
}

export interface PartyAssetsQuery_partiesConnection {
  __typename: "PartyConnection";
  /**
   * The parties in this connection
   */
  edges: PartyAssetsQuery_partiesConnection_edges[];
}

export interface PartyAssetsQuery {
  /**
   * One or more entities that are trading on the Vega network
   */
  partiesConnection: PartyAssetsQuery_partiesConnection | null;
}

export interface PartyAssetsQueryVariables {
  partyId: string;
}
