/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CreateWithdrawPage
// ====================================================

export interface CreateWithdrawPage_party_withdrawals {
  __typename: "Withdrawal";
  /**
   * The Vega internal id of the withdrawal
   */
  id: string;
}

export interface CreateWithdrawPage_party {
  __typename: "Party";
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: CreateWithdrawPage_party_withdrawals[] | null;
}

export interface CreateWithdrawPage_assets_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface CreateWithdrawPage_assets_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type CreateWithdrawPage_assets_source = CreateWithdrawPage_assets_source_BuiltinAsset | CreateWithdrawPage_assets_source_ERC20;

export interface CreateWithdrawPage_assets {
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
  source: CreateWithdrawPage_assets_source;
}

export interface CreateWithdrawPage {
  /**
   * An entity that is trading on the VEGA network
   */
  party: CreateWithdrawPage_party | null;
  /**
   * The list of all assets in use in the vega network
   */
  assets: CreateWithdrawPage_assets[] | null;
}

export interface CreateWithdrawPageVariables {
  partyId: string;
}
