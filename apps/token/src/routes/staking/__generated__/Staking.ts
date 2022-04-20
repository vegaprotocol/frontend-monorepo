/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: Staking
// ====================================================

export interface Staking_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
  currentStakeAvailableFormatted: string;
}

export interface Staking_party_delegations_node {
  __typename: "Node";
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
}

export interface Staking_party_delegations {
  __typename: "Delegation";
  /**
   * Amount delegated
   */
  amount: string;
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
   * Timestamps for start/end etc
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

export interface Staking_nodes {
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
   * Ethereum public key of the node
   */
  ethereumAdddress: string;
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
  epochData: Staking_nodes_epochData | null;
  status: NodeStatus;
}

export interface Staking_nodeData {
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

export interface Staking {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Staking_party | null;
  /**
   * get data for a specific epoch, if id omitted it gets the current epoch. If the string is 'next', fetch the next epoch
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
