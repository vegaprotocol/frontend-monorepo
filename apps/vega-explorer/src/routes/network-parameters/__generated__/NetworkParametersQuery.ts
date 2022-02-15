/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkParametersQuery
// ====================================================

export interface NetworkParametersQuery_networkParameters {
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

export interface NetworkParametersQuery {
  /**
   * return the full list of network parameters
   */
  networkParameters: NetworkParametersQuery_networkParameters[] | null;
}
