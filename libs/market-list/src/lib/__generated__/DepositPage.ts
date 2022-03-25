/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DepositPage
// ====================================================

export interface DepositPage_assets_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface DepositPage_assets_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type DepositPage_assets_source = DepositPage_assets_source_BuiltinAsset | DepositPage_assets_source_ERC20;

export interface DepositPage_assets {
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
  source: DepositPage_assets_source;
}

export interface DepositPage {
  /**
   * The list of all assets in use in the vega network
   */
  assets: DepositPage_assets[] | null;
}
