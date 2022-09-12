/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: WithdrawalFields
// ====================================================

export interface WithdrawalFields_asset {
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
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
}

export interface WithdrawalFields_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawalFields {
  __typename: "Withdrawal";
  /**
   * The Vega internal ID of the withdrawal
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
  asset: WithdrawalFields_asset;
  /**
   * RFC3339Nano time at which the withdrawal was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the withdrawal was finalised
   */
  withdrawnTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
  /**
   * Foreign chain specific details about the withdrawal
   */
  details: WithdrawalFields_details | null;
  /**
   * Whether or the not the withdrawal is being processed on Ethereum
   */
  pendingOnForeignChain: boolean;
}
