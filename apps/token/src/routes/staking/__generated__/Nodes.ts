/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Nodes
// ====================================================

export interface Nodes_nodes_epochData {
  __typename: "EpochData";
  /**
   * Total number of epochs since node was created
   */
  total: number;
  /**
   * Total number of offline epochs since node was created
   */
  offline: number;
  /**
   * Total number of online epochs since node was created
   */
  online: number;
}

export interface Nodes_nodes_rankingScore {
  __typename: "RankingScore";
  /**
   * The ranking score of the validator
   */
  rankingScore: string;
  /**
   * The stake based score of the validator (no anti-whaling)
   */
  stakeScore: string;
  /**
   * The performance score of the validator
   */
  performanceScore: string;
  /**
   * The tendermint voting power of the validator (uint32)
   */
  votingPower: string;
}

export interface Nodes_nodes {
  __typename: "Node";
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
  name: string;
  /**
   * Pubkey of the node operator
   */
  pubkey: string;
  /**
   * URL where I can find out more info on the node. Will this be possible?
   */
  infoUrl: string;
  /**
   * Country code for the location of the node
   */
  location: string;
  /**
   * The amount the node has put up themselves
   */
  stakedByOperator: string;
  /**
   * The amount of stake that has been delegated by token holders
   */
  stakedByDelegates: string;
  /**
   * Total amount staked on node
   */
  stakedTotal: string;
  /**
   * Amount of stake on the next epoch
   */
  pendingStake: string;
  stakedByOperatorFormatted: string;
  stakedByDelegatesFormatted: string;
  stakedTotalFormatted: string;
  pendingStakeFormatted: string;
  epochData: Nodes_nodes_epochData | null;
  status: NodeStatus;
  /**
   * Ranking scores and status for the validator for the current epoch
   */
  rankingScore: Nodes_nodes_rankingScore;
}

export interface Nodes_nodeData {
  __typename: "NodeData";
  /**
   * Total staked amount across all nodes
   */
  stakedTotal: string;
  stakedTotalFormatted: string;
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

export interface Nodes {
  /**
   * all known network nodes
   */
  nodes: Nodes_nodes[] | null;
  /**
   * returns information about nodes
   */
  nodeData: Nodes_nodeData | null;
}
