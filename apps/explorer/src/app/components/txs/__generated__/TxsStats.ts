/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TxsStats
// ====================================================

export interface TxsStats_statistics {
  __typename: "Statistics";
  /**
   * Average number of orders added per blocks
   */
  averageOrdersPerBlock: string;
  /**
   * Number of orders per seconds
   */
  ordersPerSecond: string;
  /**
   * Number of transaction processed per block
   */
  txPerBlock: string;
  /**
   * Number of the trades per seconds
   */
  tradesPerSecond: string;
}

export interface TxsStats {
  /**
   * Get statistics about the Vega node
   */
  statistics: TxsStats_statistics;
}
