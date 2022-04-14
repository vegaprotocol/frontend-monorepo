/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Erc20Approval
// ====================================================

export interface Erc20Approval_erc20WithdrawalApproval {
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
}

export interface Erc20Approval {
  /**
   * find an erc20 withdrawal approval using its withdrawal id
   */
  erc20WithdrawalApproval: Erc20Approval_erc20WithdrawalApproval | null;
}

export interface Erc20ApprovalVariables {
  withdrawalId: string;
}
