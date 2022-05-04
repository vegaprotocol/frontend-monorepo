/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from "./../../../../../../libs/types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WithdrawPageQuery
// ====================================================

export interface WithdrawPageQuery_party_withdrawals {
  __typename: "Withdrawal";
  /**
   * The Vega internal id of the withdrawal
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
   * The id of the asset
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

export interface WithdrawPageQuery_assets_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface WithdrawPageQuery_assets_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type WithdrawPageQuery_assets_source = WithdrawPageQuery_assets_source_BuiltinAsset | WithdrawPageQuery_assets_source_ERC20;

export interface WithdrawPageQuery_assets {
  __typename: "Asset";
  /**
   * The id of the asset
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
   * The precision of the asset
   */
  decimals: number;
  /**
   * The origin source of the asset (e.g: an erc20 asset)
   */
  source: WithdrawPageQuery_assets_source;
}

export interface WithdrawPageQuery {
  /**
   * An entity that is trading on the VEGA network
   */
  party: WithdrawPageQuery_party | null;
  /**
   * The list of all assets in use in the vega network
   */
  assets: WithdrawPageQuery_assets[] | null;
}

export interface WithdrawPageQueryVariables {
  partyId: string;
}
