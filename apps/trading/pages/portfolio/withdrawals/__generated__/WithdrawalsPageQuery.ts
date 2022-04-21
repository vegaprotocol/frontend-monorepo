/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "./../../../../../../libs/types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WithdrawalsPageQuery
// ====================================================

export interface WithdrawalsPageQuery_party_withdrawals_asset {
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

export interface WithdrawalsPageQuery_party_withdrawals_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawalsPageQuery_party_withdrawals {
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
  asset: WithdrawalsPageQuery_party_withdrawals_asset;
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
  details: WithdrawalsPageQuery_party_withdrawals_details | null;
  /**
   * Whether or the not the withdrawal is being processed on Ethereum
   */
  pendingOnForeignChain: boolean;
}

export interface WithdrawalsPageQuery_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: WithdrawalsPageQuery_party_withdrawals[] | null;
}

export interface WithdrawalsPageQuery {
  /**
   * An entity that is trading on the VEGA network
   */
  party: WithdrawalsPageQuery_party | null;
}

export interface WithdrawalsPageQueryVariables {
  partyId: string;
}
