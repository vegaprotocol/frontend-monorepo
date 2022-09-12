/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PendingWithdrawal
// ====================================================

export interface PendingWithdrawal {
  __typename: "Withdrawal";
  /**
   * Whether or the not the withdrawal is being processed on Ethereum
   */
  pendingOnForeignChain: boolean;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}
