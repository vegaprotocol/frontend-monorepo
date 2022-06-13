/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus, WithdrawalStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Transactions
// ====================================================

export interface Transactions_party_deposits_asset {
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

export interface Transactions_party_deposits {
  __typename: "Deposit";
  /**
   * The Vega internal id of the deposit
   */
  id: string;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * RFC3339Nano time at which the deposit was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the deposit was finalized
   */
  creditedTimestamp: string | null;
  /**
   * The asset to be withdrawn
   */
  asset: Transactions_party_deposits_asset;
  /**
   * The current status of the deposit
   */
  status: DepositStatus;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}

export interface Transactions_party_withdrawals_asset {
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

export interface Transactions_party_withdrawals_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface Transactions_party_withdrawals {
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
  asset: Transactions_party_withdrawals_asset;
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
  details: Transactions_party_withdrawals_details | null;
  /**
   * Whether or the not the withdrawal is being processed on Ethereum
   */
  pendingOnForeignChain: boolean;
}

export interface Transactions_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The list of all deposits for a party by the party
   */
  deposits: Transactions_party_deposits[] | null;
  /**
   * The list of all withdrawals initiated by the party
   */
  withdrawals: Transactions_party_withdrawals[] | null;
}

export interface Transactions {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Transactions_party | null;
}

export interface TransactionsVariables {
  partyId: string;
}
