/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: AssetsQuery
// ====================================================

export interface AssetsQuery_assetsConnection_edges_node_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export interface AssetsQuery_assetsConnection_edges_node_source_BuiltinAsset {
  __typename: "BuiltinAsset";
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export type AssetsQuery_assetsConnection_edges_node_source = AssetsQuery_assetsConnection_edges_node_source_ERC20 | AssetsQuery_assetsConnection_edges_node_source_BuiltinAsset;

export interface AssetsQuery_assetsConnection_edges_node_infrastructureFeeAccount_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface AssetsQuery_assetsConnection_edges_node_infrastructureFeeAccount {
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
   * Market (only relevant to margin accounts)
   */
  market: AssetsQuery_assetsConnection_edges_node_infrastructureFeeAccount_market | null;
}

export interface AssetsQuery_assetsConnection_edges_node {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
  /**
   * The origin source of the asset (e.g: an ERC20 asset)
   */
  source: AssetsQuery_assetsConnection_edges_node_source;
  /**
   * The infrastructure fee account for this asset
   */
  infrastructureFeeAccount: AssetsQuery_assetsConnection_edges_node_infrastructureFeeAccount;
}

export interface AssetsQuery_assetsConnection_edges {
  __typename: "AssetEdge";
  node: AssetsQuery_assetsConnection_edges_node;
}

export interface AssetsQuery_assetsConnection {
  __typename: "AssetsConnection";
  /**
   * The assets
   */
  edges: (AssetsQuery_assetsConnection_edges | null)[] | null;
}

export interface AssetsQuery {
  /**
   * The list of all assets in use in the Vega network or the specified asset if ID is provided
   */
  assetsConnection: AssetsQuery_assetsConnection;
}
