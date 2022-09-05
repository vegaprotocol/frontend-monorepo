/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketsCandles
// ====================================================

export interface MarketsCandles_marketsConnection_edges_node_candlesConnection_edges_node {
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

export interface MarketsCandles_marketsConnection_edges_node_candlesConnection_edges {
  __typename: "CandleEdge";
  node: MarketsCandles_marketsConnection_edges_node_candlesConnection_edges_node;
}

export interface MarketsCandles_marketsConnection_edges_node_candlesConnection {
  __typename: "CandleDataConnection";
  /**
   * The candles
   */
  edges: (MarketsCandles_marketsConnection_edges_node_candlesConnection_edges | null)[] | null;
}

export interface MarketsCandles_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by parameters using cursor based pagination
   */
  candlesConnection: MarketsCandles_marketsConnection_edges_node_candlesConnection;
}

export interface MarketsCandles_marketsConnection_edges {
  __typename: "MarketEdge";
  node: MarketsCandles_marketsConnection_edges_node;
}

export interface MarketsCandles_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: MarketsCandles_marketsConnection_edges[];
}

export interface MarketsCandles {
  marketsConnection: MarketsCandles_marketsConnection;
}

export interface MarketsCandlesVariables {
  interval: Interval;
  since: string;
}
