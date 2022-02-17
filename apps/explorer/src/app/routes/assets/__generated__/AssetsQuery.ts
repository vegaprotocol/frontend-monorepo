/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountType } from './../../../../__generated__/globalTypes';

// ====================================================
// GraphQL query operation: AssetsQuery
// ====================================================

export interface AssetsQuery_assets_source_ERC20 {
  __typename: 'ERC20';
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export interface AssetsQuery_assets_source_BuiltinAsset {
  __typename: 'BuiltinAsset';
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export type AssetsQuery_assets_source =
  | AssetsQuery_assets_source_ERC20
  | AssetsQuery_assets_source_BuiltinAsset;

export interface AssetsQuery_assets_infrastructureFeeAccount_market {
  __typename: 'Market';
  /**
   * Market ID
   */
  id: string;
}

export interface AssetsQuery_assets_infrastructureFeeAccount {
  __typename: 'Account';
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
  market: AssetsQuery_assets_infrastructureFeeAccount_market | null;
}

export interface AssetsQuery_assets {
  __typename: 'Asset';
  /**
   * The id of the asset
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
   * The total supply of the market
   */
  totalSupply: string;
  /**
   * The precision of the asset
   */
  decimals: number;
  /**
   * The min stake to become an lp for any market using this asset for settlement
   */
  minLpStake: string;
  /**
   * The origin source of the asset (e.g: an erc20 asset)
   */
  source: AssetsQuery_assets_source;
  /**
   * The infrastructure fee account for this asset
   */
  infrastructureFeeAccount: AssetsQuery_assets_infrastructureFeeAccount;
}

export interface AssetsQuery {
  /**
   * The list of all assets in use in the vega network
   */
  assets: AssetsQuery_assets[] | null;
}
