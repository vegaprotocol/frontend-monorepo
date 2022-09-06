/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Staking
// ====================================================

export interface Staking_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
  /**
   * The currently available stake formatted by the client
   */
  currentStakeAvailableFormatted: string;
}

export interface Staking_party_delegations_node {
  __typename: "Node";
  /**
   * The node URL eg n01.vega.xyz
   */
  id: string;
}

export interface Staking_party_delegations {
  __typename: "Delegation";
  /**
   * Amount delegated
   */
  amount: string;
  /**
   * The amount field formatted by the client
   */
  amountFormatted: string;
  /**
   * Epoch of delegation
   */
  epoch: number;
  /**
   * URL of node you are delegating to
   */
  node: Staking_party_delegations_node;
}

export interface Staking_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: Staking_party_stake;
  delegations: Staking_party_delegations[] | null;
}

export interface Staking_epoch_timestamps {
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

export interface Staking_epoch {
  __typename: "Epoch";
  /**
   * Presumably this is an integer or something. If there's no such thing, disregard
   */
  id: string;
  /**
   * Timestamps for start and end of epochs
   */
  timestamps: Staking_epoch_timestamps;
}

export interface Staking_nodes_epochData {
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

export interface Staking_nodes_rankingScore {
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
}

export interface Staking_nodes {
  __typename: "Node";
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
   * URL from which you can get more info about the node.
   */
  infoUrl: string;
  /**
   * Country code for the location of the node
   */
  location: string;
  /**
   * Ethereum public key of the node
   */
  ethereumAddress: string;
  /**
   * The amount of stake the node has put up themselves
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
  /**
   * The stakes by operator field formatted by the client
   */
  stakedByOperatorFormatted: string;
  /**
   * The stakes by delegates field formatted by the client
   */
  stakedByDelegatesFormatted: string;
  /**
   * The total staked field formatted by the client
   */
  stakedTotalFormatted: string;
  /**
   * The pending staked field formatted by the client
   */
  pendingStakeFormatted: string;
  epochData: Staking_nodes_epochData | null;
  status: NodeStatus;
  /**
   * Ranking scores and status for the validator for the current epoch
   */
  rankingScore: Staking_nodes_rankingScore;
}

export interface Staking_nodeData {
  __typename: "NodeData";
  /**
   * Total staked amount across all nodes
   */
  stakedTotal: string;
  /**
   * The total staked field formatted by the client
   */
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

export interface Staking {
  /**
   * An entity that is trading on the Vega network
   */
  party: Staking_party | null;
  /**
   * get data for a specific epoch, if ID omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: Staking_epoch;
  /**
   * all known network nodes
   */
  nodes: Staking_nodes[] | null;
  /**
   * returns information about nodes
   */
  nodeData: Staking_nodeData | null;
}

export interface StakingVariables {
  partyId: string;
}
