/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NodeData
// ====================================================

export interface NodeData_nodeData {
  __typename: "NodeData";
  /**
   * Total staked amount across all nodes
   */
  stakedTotal: string;
  stakedTotalFormatted: string;
}

export interface NodeData {
  /**
   * returns information about nodes
   */
  nodeData: NodeData_nodeData | null;
}
