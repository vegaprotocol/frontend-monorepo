/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkParams
// ====================================================

export interface NetworkParams_networkParametersConnection_edges_node {
  __typename: "NetworkParameter";
  /**
   * The name of the network parameter
   */
  key: string;
  /**
   * The value of the network parameter
   */
  value: string;
}

export interface NetworkParams_networkParametersConnection_edges {
  __typename: "NetworkParameterEdge";
  /**
   * The network parameter
   */
  node: NetworkParams_networkParametersConnection_edges_node;
}

export interface NetworkParams_networkParametersConnection {
  __typename: "NetworkParametersConnection";
  /**
   * List of network parameters available for the connection
   */
  edges: (NetworkParams_networkParametersConnection_edges | null)[] | null;
}

export interface NetworkParams {
  /**
   * Return the full list of network parameters
   */
  networkParametersConnection: NetworkParams_networkParametersConnection;
}
