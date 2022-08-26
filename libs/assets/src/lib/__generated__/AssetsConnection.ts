/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AssetsConnection
// ====================================================

export interface AssetsConnection_assetsConnection_edges_node_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface AssetsConnection_assetsConnection_edges_node_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure for alpha mainnet
   */
  lifetimeLimit: string;
  /**
   * The maximum allowed per withdrawal
   * Note: this is a temporary measure for alpha mainnet
   */
  withdrawThreshold: string;
}

export type AssetsConnection_assetsConnection_edges_node_source = AssetsConnection_assetsConnection_edges_node_source_BuiltinAsset | AssetsConnection_assetsConnection_edges_node_source_ERC20;

export interface AssetsConnection_assetsConnection_edges_node {
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
   * The minimum economically meaningful amount in the asset
   */
  quantum: string;
  /**
   * The origin source of the asset (e.g: an ERC20 asset)
   */
  source: AssetsConnection_assetsConnection_edges_node_source;
}

export interface AssetsConnection_assetsConnection_edges {
  __typename: "AssetEdge";
  node: AssetsConnection_assetsConnection_edges_node;
}

export interface AssetsConnection_assetsConnection {
  __typename: "AssetsConnection";
  /**
   * The assets
   */
  edges: (AssetsConnection_assetsConnection_edges | null)[] | null;
}

export interface AssetsConnection {
  /**
   * The list of all assets in use in the Vega network or the specified asset if ID is provided
   */
  assetsConnection: AssetsConnection_assetsConnection;
}
