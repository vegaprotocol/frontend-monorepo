/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ValidatorStatus } from "@vegaprotocol/types";

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
   * The Tendermint voting power of the validator (uint32)
   */
  votingPower: string;
  /**
   * The current validation status of the validator
   */
  status: ValidatorStatus;
}

export interface Nodes_nodes {
  __typename: "Node";
  avatarUrl: string | null;
  /**
   * The node URL eg n01.vega.xyz
   */
  id: string;
  name: string;
  /**
   * Public key of the node operator
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
  pendingStakeFormatted: string;
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
