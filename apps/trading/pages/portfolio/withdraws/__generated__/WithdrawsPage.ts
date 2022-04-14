/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "./../../../../../../libs/types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WithdrawsPage
// ====================================================

export interface WithdrawsPage_party_withdrawals_asset {
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

export interface WithdrawsPage_party_withdrawals_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawsPage_party_withdrawals {
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
  asset: WithdrawsPage_party_withdrawals_asset;
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
  details: WithdrawsPage_party_withdrawals_details | null;
}

export interface WithdrawsPage_party {
  __typename: "Party";
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawsPage_party_withdrawals[] | null;
}

export interface WithdrawsPage {
  /**
   * An entity that is trading on the VEGA network
   */
  party: WithdrawsPage_party | null;
}

export interface WithdrawsPageVariables {
  partyId: string;
}
