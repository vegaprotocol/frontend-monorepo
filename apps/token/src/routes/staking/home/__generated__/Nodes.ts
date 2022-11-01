/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ValidatorStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Nodes
// ====================================================

export interface Nodes_epoch_timestamps {
  __typename: "EpochTimestamps";
  /**
   * RFC3339 timestamp - Vega time of epoch start, null if not started
   */
  start: string | null;
  /**
   * RFC3339 timestamp - Vega time of epoch end, null if not ended
   */
  end: string | null;
  /**
   * RFC3339 timestamp - Vega time of epoch expiry
   */
  expiry: string | null;
}

export interface Nodes_epoch {
  __typename: "Epoch";
  /**
   * Numeric sequence number used to identify the epoch
   */
  id: string;
  /**
   * Timestamps for start and end of epochs
   */
  timestamps: Nodes_epoch_timestamps;
}

export interface Nodes_nodesConnection_edges_node_rankingScore {
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

export interface Nodes_nodesConnection_edges_node {
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
  /**
   * The total staked field formatted by the client
   */
  stakedTotalFormatted: string;
  /**
   * Amount of stake on the next epoch
   */
  pendingStake: string;
  /**
   * The pending staked field formatted by the client
   */
  pendingStakeFormatted: string;
  /**
   * Ranking scores and status for the validator for the current epoch
   */
  rankingScore: Nodes_nodesConnection_edges_node_rankingScore;
}

export interface Nodes_nodesConnection_edges {
  __typename: "NodeEdge";
  /**
   * The node
   */
  node: Nodes_nodesConnection_edges_node;
}

export interface Nodes_nodesConnection {
  __typename: "NodesConnection";
  /**
   * List of nodes available for the connection
   */
  edges: (Nodes_nodesConnection_edges | null)[] | null;
}

export interface Nodes_nodeData {
  __typename: "NodeData";
  /**
   * Total staked amount across all nodes
   */
  stakedTotal: string;
  /**
   * The total staked field formatted by the client
   */
  stakedTotalFormatted: string;
}

export interface Nodes {
  /**
   * Get data for a specific epoch, if ID omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: Nodes_epoch;
  /**
   * All known network nodes
   */
  nodesConnection: Nodes_nodesConnection;
  /**
   * Returns information about nodes
   */
  nodeData: Nodes_nodeData | null;
}
