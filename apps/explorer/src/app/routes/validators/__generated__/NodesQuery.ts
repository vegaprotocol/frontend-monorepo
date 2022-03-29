/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from "./../../../../../../../libs/graphql/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: NodesQuery
// ====================================================

export interface NodesQuery_nodes_epochData {
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

export interface NodesQuery_nodes {
  __typename: "Node";
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
  name: string;
  /**
   * URL where I can find out more info on the node. Will this be possible?
   */
  infoUrl: string;
  avatarUrl: string | null;
  /**
   * Pubkey of the node operator
   */
  pubkey: string;
  /**
   * Public key of Tendermint
   */
  tmPubkey: string;
  /**
   * Ethereum public key of the node
   */
  ethereumAdddress: string;
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
  epochData: NodesQuery_nodes_epochData | null;
  status: NodeStatus;
}

export interface NodesQuery {
  /**
   * all known network nodes
   */
  nodes: NodesQuery_nodes[] | null;
}
