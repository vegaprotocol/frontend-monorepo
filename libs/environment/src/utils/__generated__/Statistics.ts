/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Statistics
// ====================================================

export interface Statistics_statistics {
  __typename: "Statistics";
  /**
   * Current chain ID
   */
  chainId: string;
  /**
   * Current block number
   */
  blockHeight: string;
}

export interface Statistics {
  /**
   * get statistics about the Vega node
   */
  statistics: Statistics_statistics;
}
