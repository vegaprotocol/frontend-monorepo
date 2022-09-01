/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkParamsQuery
// ====================================================

export interface NetworkParamsQuery_networkParameters {
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

export interface NetworkParamsQuery {
  /**
   * return the full list of network parameters
   */
  networkParameters: NetworkParamsQuery_networkParameters[] | null;
}
