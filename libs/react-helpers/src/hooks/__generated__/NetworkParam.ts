/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkParam
// ====================================================

export interface NetworkParam_networkParameter {
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

export interface NetworkParam {
  /**
   * Return a single network parameter
   */
  networkParameter: NetworkParam_networkParameter | null;
}

export interface NetworkParamVariables {
  key: string;
}
