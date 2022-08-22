/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LiquidityProvisionStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: LiquidityQuery
// ====================================================

export interface LiquidityQuery_market_data_liquidityProviderFeeShare_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface LiquidityQuery_market_data_liquidityProviderFeeShare {
  __typename: "LiquidityProviderFeeShare";
  /**
   * The liquidity provider party id
   */
  party: LiquidityQuery_market_data_liquidityProviderFeeShare_party;
  /**
   * The share own by this liquidity provider (float)
   */
  equityLikeShare: string;
  /**
   * the average entry valuation of the liquidity provider for the market
   */
  averageEntryValuation: string;
}

export interface LiquidityQuery_market_data {
  __typename: "MarketData";
  /**
   * the supplied stake for the market
   */
  suppliedStake: string | null;
  /**
   * the sum of the size of all positions greater than 0.
   */
  openInterest: string;
  /**
   * the amount of stake targeted for this market
   */
  targetStake: string | null;
  /**
   * the market value proxy
   */
  marketValueProxy: string;
  /**
   * the equity like share of liquidity fee for each liquidity provider
   */
  liquidityProviderFeeShare: LiquidityQuery_market_data_liquidityProviderFeeShare[] | null;
}

export interface LiquidityQuery_market_liquidityProvisionsConnection_edges_node_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface LiquidityQuery_market_liquidityProvisionsConnection_edges_node {
  __typename: "LiquidityProvision";
  /**
   * Unique identifier for the order (set by the system after consensus)
   */
  id: string | null;
  /**
   * The Id of the party making this commitment
   */
  party: LiquidityQuery_market_liquidityProvisionsConnection_edges_node_party;
  /**
   * When the liquidity provision was initially created (formatted RFC3339)
   */
  createdAt: string;
  /**
   * RFC3339Nano time of when the liquidity provision was updated
   */
  updatedAt: string | null;
  /**
   * Specified as a unit-less number that represents the amount of settlement asset of the market.
   */
  commitmentAmount: string;
  /**
   * nominated liquidity fee factor, which is an input to the calculation of taker fees on the market, as per setting fees and rewarding liquidity providers.
   */
  fee: string;
  /**
   * The version of this LiquidityProvision
   */
  version: string;
  /**
   * A reference for the orders created out of this Liquidity provision
   */
  reference: string | null;
  /**
   * The current status of this liquidity provision
   */
  status: LiquidityProvisionStatus;
}

export interface LiquidityQuery_market_liquidityProvisionsConnection_edges {
  __typename: "LiquidityProvisionsEdge";
  node: LiquidityQuery_market_liquidityProvisionsConnection_edges_node;
}

export interface LiquidityQuery_market_liquidityProvisionsConnection {
  __typename: "LiquidityProvisionsConnection";
  totalCount: number;
  edges: (LiquidityQuery_market_liquidityProvisionsConnection_edges | null)[] | null;
}

export interface LiquidityQuery_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * marketData for the given market
   */
  data: LiquidityQuery_market_data | null;
  /**
   * The list of the liquidity provision commitment for this market
   */
  liquidityProvisionsConnection: LiquidityQuery_market_liquidityProvisionsConnection;
}

export interface LiquidityQuery {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: LiquidityQuery_market | null;
}
