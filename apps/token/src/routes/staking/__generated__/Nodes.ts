/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Nodes
// ====================================================

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
  /**
   * The current validation status of the validator
   */
  status: string;
}

export interface Nodes_nodes {
  __typename: "Node";
  avatarUrl: string | null;
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
   * Total amount staked on node
   */
  stakedTotal: string;
  stakedTotalFormatted: string;
  /**
   * Amount of stake on the next epoch
   */
  pendingStake: string;
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
