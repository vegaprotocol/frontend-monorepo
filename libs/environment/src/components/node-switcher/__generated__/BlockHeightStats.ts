/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BlockHeightStats
// ====================================================

export interface BlockHeightStats_statistics {
  __typename: "Statistics";
  /**
   * Current block number
   */
  blockHeight: string;
}

export interface BlockHeightStats {
  /**
   * get statistics about the vega node
   */
  statistics: BlockHeightStats_statistics;
}
