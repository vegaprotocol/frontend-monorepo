/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Erc20ApprovalNew
// ====================================================

export interface Erc20ApprovalNew_erc20WithdrawalApproval {
  __typename: "Erc20WithdrawalApproval";
  /**
   * The source asset in the ethereum network
   */
  assetSource: string;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The nonce to be used in the request
   */
  nonce: string;
  /**
   * Signature aggregate from the nodes, in the following format:
   * 0x + sig1 + sig2 + ... + sigN
   */
  signatures: string;
  /**
   * The target address which will receive the funds
   */
  targetAddress: string;
  /**
   * Timestamp in seconds for expiry of the approval
   */
  expiry: string;
  /**
   * Timestamp at which the withdrawal was created
   */
  creation: string;
}

export interface Erc20ApprovalNew {
  /**
   * find an erc20 withdrawal approval using its withdrawal id
   */
  erc20WithdrawalApproval: Erc20ApprovalNew_erc20WithdrawalApproval | null;
}

export interface Erc20ApprovalNewVariables {
  withdrawalId: string;
}
