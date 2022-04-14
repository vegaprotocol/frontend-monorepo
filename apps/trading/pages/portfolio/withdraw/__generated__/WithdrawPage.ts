/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "./../../../../../../libs/types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WithdrawPage
// ====================================================

export interface WithdrawPage_party_withdrawals_asset {
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
   * The precision of the asset
   */
  decimals: number;
}

export interface WithdrawPage_party_withdrawals_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawPage_party_withdrawals {
  __typename: "Withdrawal";
  /**
   * The Vega internal id of the withdrawal
   */
  id: string;
  /**
   * The current status of the withdrawal
   */
  status: WithdrawalStatus;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The asset to be withdrawn
   */
  asset: WithdrawPage_party_withdrawals_asset;
  /**
   * RFC3339Nano time at which the withdrawal was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the withdrawal was finalized
   */
  withdrawnTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
  /**
   * Foreign chain specific details about the withdrawal
   */
  details: WithdrawPage_party_withdrawals_details | null;
}

export interface WithdrawPage_party {
  __typename: "Party";
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawPage_party_withdrawals[] | null;
}

export interface WithdrawPage_assets_source_BuiltinAsset {
  __typename: "BuiltinAsset";
}

export interface WithdrawPage_assets_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type WithdrawPage_assets_source = WithdrawPage_assets_source_BuiltinAsset | WithdrawPage_assets_source_ERC20;

export interface WithdrawPage_assets {
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
  source: WithdrawPage_assets_source;
}

export interface WithdrawPage {
  /**
   * An entity that is trading on the VEGA network
   */
  party: WithdrawPage_party | null;
  /**
   * The list of all assets in use in the vega network
   */
  assets: WithdrawPage_assets[] | null;
}

export interface WithdrawPageVariables {
  partyId: string;
}
