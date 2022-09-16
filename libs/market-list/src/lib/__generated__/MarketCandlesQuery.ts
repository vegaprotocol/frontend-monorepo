/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketCandlesQuery
// ====================================================

export interface MarketCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node {
  __typename: "CandleNode";
  /**
   * High price (uint64)
   */
  high: string;
  /**
   * Low price (uint64)
   */
  low: string;
  /**
   * Open price (uint64)
   */
  open: string;
  /**
   * Close price (uint64)
   */
  close: string;
  /**
   * Volume price (uint64)
   */
  volume: string;
}

export interface MarketCandlesQuery_marketsConnection_edges_node_candlesConnection_edges {
  __typename: "CandleEdge";
  node: MarketCandlesQuery_marketsConnection_edges_node_candlesConnection_edges_node;
}

export interface MarketCandlesQuery_marketsConnection_edges_node_candlesConnection {
  __typename: "CandleDataConnection";
  /**
   * The candles
   */
  edges: (MarketCandlesQuery_marketsConnection_edges_node_candlesConnection_edges | null)[] | null;
}

export interface MarketCandlesQuery_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters using cursor based pagination
   */
  candlesConnection: MarketCandlesQuery_marketsConnection_edges_node_candlesConnection;
}

export interface MarketCandlesQuery_marketsConnection_edges {
  __typename: "MarketEdge";
  node: MarketCandlesQuery_marketsConnection_edges_node;
}

export interface MarketCandlesQuery_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: MarketCandlesQuery_marketsConnection_edges[];
}

export interface MarketCandlesQuery {
  marketsConnection: MarketCandlesQuery_marketsConnection;
}

export interface MarketCandlesQueryVariables {
  interval: Interval;
  since: string;
  marketId: string;
}
