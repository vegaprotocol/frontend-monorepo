/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NetworkParametersQuery
// ====================================================

export interface NetworkParametersQuery_markets {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface NetworkParametersQuery {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: NetworkParametersQuery_markets[] | null;
}
