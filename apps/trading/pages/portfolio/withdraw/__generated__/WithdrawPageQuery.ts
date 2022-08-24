/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: WithdrawPageQuery
// ====================================================

export interface WithdrawPageQuery_party_withdrawals {
  __typename: "Withdrawal";
  /**
   * The Vega internal ID of the withdrawal
   */
  id: string;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}

export interface WithdrawPageQuery_party_accounts_asset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface WithdrawPageQuery_party_accounts {
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
  asset: WithdrawPageQuery_party_accounts_asset;
}

export interface WithdrawPageQuery_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawPageQuery_party_withdrawals[] | null;
  /**
   * Collateral accounts relating to a party
   */
  accounts: WithdrawPageQuery_party_accounts[] | null;
}

export interface WithdrawPageQuery_assetsConnection_edges_node_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface WithdrawPageQuery_assetsConnection_edges_node_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export type WithdrawPageQuery_assetsConnection_edges_node_source = WithdrawPageQuery_assetsConnection_edges_node_source_BuiltinAsset | WithdrawPageQuery_assetsConnection_edges_node_source_ERC20;

export interface WithdrawPageQuery_assetsConnection_edges_node {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
  /**
   * The origin source of the asset (e.g: an ERC20 asset)
   */
  source: WithdrawPageQuery_assetsConnection_edges_node_source;
}

export interface WithdrawPageQuery_assetsConnection_edges {
  __typename: "AssetEdge";
  node: WithdrawPageQuery_assetsConnection_edges_node;
}

export interface WithdrawPageQuery_assetsConnection {
  __typename: "AssetsConnection";
  /**
   * The assets
   */
  edges: (WithdrawPageQuery_assetsConnection_edges | null)[] | null;
}

export interface WithdrawPageQuery {
  /**
   * An entity that is trading on the Vega network
   */
  party: WithdrawPageQuery_party | null;
  /**
   * The list of all assets in use in the Vega network or the specified asset if ID is provided
   */
  assetsConnection: WithdrawPageQuery_assetsConnection;
}

export interface WithdrawPageQueryVariables {
  partyId: string;
}
