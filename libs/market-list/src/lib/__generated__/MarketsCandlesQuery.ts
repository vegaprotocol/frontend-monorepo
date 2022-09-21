/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketsCandlesQuery
// ====================================================

export interface MarketsCandlesQuery_marketsConnection_edges_node_candles {
  __typename: "Candle";
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

export interface MarketsCandlesQuery_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters
   */
  candles: (MarketsCandlesQuery_marketsConnection_edges_node_candles | null)[] | null;
}

export interface MarketsCandlesQuery_marketsConnection_edges {
  __typename: "MarketEdge";
  node: MarketsCandlesQuery_marketsConnection_edges_node;
}

export interface MarketsCandlesQuery_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: MarketsCandlesQuery_marketsConnection_edges[];
}

export interface MarketsCandlesQuery {
  marketsConnection: MarketsCandlesQuery_marketsConnection | null;
}

export interface MarketsCandlesQueryVariables {
  interval: Interval;
  since: string;
}
