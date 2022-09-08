/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkStats
// ====================================================

export interface NetworkStats_nodeData {
  __typename: "NodeData";
  /**
   * Total staked amount across all nodes
   */
  stakedTotal: string;
  /**
   * Total number of nodes
   */
  totalNodes: number;
  /**
   * Number of inactive nodes
   */
  inactiveNodes: number;
  /**
   * Number of nodes validating
   */
  validatingNodes: number;
  /**
   * Total uptime for all epochs across all nodes. Or specify a number of epochs
   */
  uptime: number;
}

export interface NetworkStats_statistics {
  __typename: "Statistics";
  /**
   * Status of the vega application connection with the chain
   */
  status: string;
  /**
   * Current block number
   */
  blockHeight: string;
  /**
   * Duration of the last block, in nanoseconds
   */
  blockDuration: string;
  /**
   * Number of items in the backlog
   */
  backlogLength: string;
  /**
   * Number of transaction processed per block
   */
  txPerBlock: string;
  /**
   * Number of the trades per seconds
   */
  tradesPerSecond: string;
  /**
   * Number of orders per seconds
   */
  ordersPerSecond: string;
  /**
   * Average number of orders added per blocks
   */
  averageOrdersPerBlock: string;
  /**
   * RFC3339Nano current time of the chain (decided through consensus)
   */
  vegaTime: string;
  /**
   * Version of the vega node (semver)
   */
  appVersion: string;
  /**
   * Version of the chain (semver)
   */
  chainVersion: string;
  /**
   * Current chain id
   */
  chainId: string;
}

export interface NetworkStats {
  /**
   * returns information about nodes
   */
  nodeData: NetworkStats_nodeData | null;
  /**
   * get statistics about the vega node
   */
  statistics: NetworkStats_statistics;
}
