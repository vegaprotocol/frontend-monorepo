/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import * as Schema from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: WithdrawFormQuery
// ====================================================

export interface WithdrawFormQuery_party_withdrawals {
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

export interface WithdrawFormQuery_party_accounts_asset {
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

export interface WithdrawFormQuery_party_accounts {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: Schema.AccountType;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Asset, the 'currency'
   */
  asset: WithdrawFormQuery_party_accounts_asset;
}

export interface WithdrawFormQuery_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawFormQuery_party_withdrawals[] | null;
  /**
   * Collateral accounts relating to a party
   */
  accounts: WithdrawFormQuery_party_accounts[] | null;
}

export interface WithdrawFormQuery_assets_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface WithdrawFormQuery_assets_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export type WithdrawFormQuery_assets_source = WithdrawFormQuery_assets_source_BuiltinAsset | WithdrawFormQuery_assets_source_ERC20;

export interface WithdrawFormQuery_assets {
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
  source: WithdrawFormQuery_assets_source;
}

export interface WithdrawFormQuery {
  /**
   * An entity that is trading on the Vega network
   */
  party: WithdrawFormQuery_party | null;
  /**
   * The list of all assets in use in the Vega network
   */
  assets: WithdrawFormQuery_assets[] | null;
}

export interface WithdrawFormQueryVariables {
  partyId: string;
}
