/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Pagination, Side } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Fills
// ====================================================

export interface Fills_party_tradesConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Fills_party_tradesConnection_edges_node_buyer {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Fills_party_tradesConnection_edges_node_seller {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Fills_party_tradesConnection_edges_node_buyerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, paid by the aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the validators to maintain the Vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the liquidity providers that committed liquidity to the market
   */
  liquidityFee: string;
}

export interface Fills_party_tradesConnection_edges_node_sellerFee {
  __typename: "TradeFee";
  /**
   * The maker fee, paid by the aggressive party to the other party (the one who had an order in the book)
   */
  makerFee: string;
  /**
   * The infrastructure fee, a fee paid to the validators to maintain the Vega network
   */
  infrastructureFee: string;
  /**
   * The fee paid to the liquidity providers that committed liquidity to the market
   */
  liquidityFee: string;
}

export interface Fills_party_tradesConnection_edges_node {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * The market the trade occurred on
   */
  market: Fills_party_tradesConnection_edges_node_market;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of units traded, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * The order that bought
   */
  buyOrder: string;
  /**
   * The order that sold
   */
  sellOrder: string;
  /**
   * The aggressor indicates whether this trade was related to a BUY or SELL
   */
  aggressor: Side;
  /**
   * The party that bought
   */
  buyer: Fills_party_tradesConnection_edges_node_buyer;
  /**
   * The party that sold
   */
  seller: Fills_party_tradesConnection_edges_node_seller;
  /**
   * The fee paid by the buyer side of the trade
   */
  buyerFee: Fills_party_tradesConnection_edges_node_buyerFee;
  /**
   * The fee paid by the seller side of the trade
   */
  sellerFee: Fills_party_tradesConnection_edges_node_sellerFee;
}

export interface Fills_party_tradesConnection_edges {
  __typename: "TradeEdge";
  node: Fills_party_tradesConnection_edges_node;
  cursor: string;
}

export interface Fills_party_tradesConnection_pageInfo {
  __typename: "PageInfo";
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Fills_party_tradesConnection {
  __typename: "TradeConnection";
  /**
   * The trade in this connection
   */
  edges: Fills_party_tradesConnection_edges[];
  /**
   * The pagination information
   */
  pageInfo: Fills_party_tradesConnection_pageInfo;
}

export interface Fills_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  tradesConnection: Fills_party_tradesConnection | null;
}

export interface Fills {
  /**
   * An entity that is trading on the Vega network
   */
  party: Fills_party | null;
}

export interface FillsVariables {
  partyId: string;
  marketId?: string | null;
  pagination?: Pagination | null;
}
