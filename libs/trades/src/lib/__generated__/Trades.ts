/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Pagination } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Trades
// ====================================================

export interface Trades_market_tradesConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Trades_market_tradesConnection_edges_node {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The market the trade occurred on
   */
  market: Trades_market_tradesConnection_edges_node_market;
}

export interface Trades_market_tradesConnection_edges {
  __typename: "TradeEdge";
  node: Trades_market_tradesConnection_edges_node;
  cursor: string;
}

export interface Trades_market_tradesConnection_pageInfo {
  __typename: "PageInfo";
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Trades_market_tradesConnection {
  __typename: "TradeConnection";
  /**
   * The trade in this connection
   */
  edges: Trades_market_tradesConnection_edges[];
  /**
   * The pagination information
   */
  pageInfo: Trades_market_tradesConnection_pageInfo;
}

export interface Trades_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  tradesConnection: Trades_market_tradesConnection | null;
}

export interface Trades {
  /**
   * An instrument that is trading on the Vega network
   */
  market: Trades_market | null;
}

export interface TradesVariables {
  marketId: string;
  pagination?: Pagination | null;
}
