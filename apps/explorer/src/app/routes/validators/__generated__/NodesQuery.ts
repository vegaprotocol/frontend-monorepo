/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NodeStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: NodesQuery
// ====================================================

export interface NodesQuery_nodesConnection_edges_node_epochData {
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

export interface NodesQuery_nodesConnection_edges_node {
  __typename: "Node";
  /**
   * The node URL eg n01.vega.xyz
   */
  id: string;
  name: string;
  /**
   * URL from which you can get more info about the node.
   */
  infoUrl: string;
  avatarUrl: string | null;
  /**
   * Public key of the node operator
   */
  pubkey: string;
  /**
   * Tendermint public key of the node
   */
  tmPubkey: string;
  /**
   * Ethereum public key of the node
   */
  ethereumAddress: string;
  /**
   * Country code for the location of the node
   */
  location: string;
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
   * Summary of epoch data across all nodes
   */
  epochData: NodesQuery_nodesConnection_edges_node_epochData | null;
  /**
   * Validator status of the node
   */
  status: NodeStatus;
}

export interface NodesQuery_nodesConnection_edges {
  __typename: "NodeEdge";
  /**
   * The node
   */
  node: NodesQuery_nodesConnection_edges_node;
}

export interface NodesQuery_nodesConnection {
  __typename: "NodesConnection";
  /**
   * List of nodes available for the connection
   */
  edges: (NodesQuery_nodesConnection_edges | null)[] | null;
}

export interface NodesQuery {
  /**
   * All known network nodes
   */
  nodesConnection: NodesQuery_nodesConnection;
}
