/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WithdrawalsPage
// ====================================================

export interface WithdrawalsPage_party_withdrawals_asset {
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

export interface WithdrawalsPage_party_withdrawals_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface WithdrawalsPage_party_withdrawals_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawalsPage_party_withdrawals {
  __typename: "Withdrawal";
  /**
   * The Vega internal id of the withdrawal
   */
  id: string;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The asset to be withdrawn
   */
  asset: WithdrawalsPage_party_withdrawals_asset;
  /**
   * The PartyID initiating the withdrawal
   */
  party: WithdrawalsPage_party_withdrawals_party;
  /**
   * The current status of the withdrawal
   */
  status: WithdrawalStatus;
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
  details: WithdrawalsPage_party_withdrawals_details | null;
}

export interface WithdrawalsPage_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawalsPage_party_withdrawals[] | null;
}

export interface WithdrawalsPage {
  /**
   * An entity that is trading on the VEGA network
   */
  party: WithdrawalsPage_party | null;
}

export interface WithdrawalsPageVariables {
  partyId: string;
}
