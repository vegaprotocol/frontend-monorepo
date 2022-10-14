/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LiquidityProvisionMarkets
// ====================================================

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges_node {
  __typename: "LiquidityProvision";
  /**
   * Specified as a unit-less number that represents the amount of settlement asset of the market.
   */
  commitmentAmount: string;
  /**
   * Nominated liquidity fee factor, which is an input to the calculation of liquidity fees on the market, as per setting fees and rewarding liquidity providers.
   */
  fee: string;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges {
  __typename: "LiquidityProvisionsEdge";
  node: LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges_node;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection {
  __typename: "LiquidityProvisionsConnection";
  edges: (LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection_edges | null)[] | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node_data {
  __typename: "MarketData";
  /**
   * The amount of stake targeted for this market
   */
  targetStake: string | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * The list of the liquidity provision commitments for this market
   */
  liquidityProvisionsConnection: LiquidityProvisionMarkets_marketsConnection_edges_node_liquidityProvisionsConnection | null;
  /**
   * marketData for the given market
   */
  data: LiquidityProvisionMarkets_marketsConnection_edges_node_data | null;
}

export interface LiquidityProvisionMarkets_marketsConnection_edges {
  __typename: "MarketEdge";
  /**
   * The market
   */
  node: LiquidityProvisionMarkets_marketsConnection_edges_node;
}

export interface LiquidityProvisionMarkets_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: LiquidityProvisionMarkets_marketsConnection_edges[];
}

export interface LiquidityProvisionMarkets {
  /**
   * One or more instruments that are trading on the Vega network
   */
  marketsConnection: LiquidityProvisionMarkets_marketsConnection | null;
}
