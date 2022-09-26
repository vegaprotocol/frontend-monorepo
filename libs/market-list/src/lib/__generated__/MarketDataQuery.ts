/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AuctionTrigger, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketDataQuery
// ====================================================

export interface MarketDataQuery_marketsConnection_edges_node_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketDataQuery_marketsConnection_edges_node_data {
  __typename: "MarketData";
  /**
   * Market of the associated mark price
   */
  market: MarketDataQuery_marketsConnection_edges_node_data_market;
  /**
   * The highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * The lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * The mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * What triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * The arithmetic average of the best static bid price and best static offer price
   */
  staticMidPrice: string;
  /**
   * What mode the market is in (auction, continuous, etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * Indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * Indicative price if the auction ended now, 0 if not in auction mode
   */
  indicativePrice: string;
  /**
   * The highest price level on an order book for buy orders not including pegged orders.
   */
  bestStaticBidPrice: string;
  /**
   * The lowest price level on an order book for offer orders not including pegged orders.
   */
  bestStaticOfferPrice: string;
}

export interface MarketDataQuery_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * marketData for the given market
   */
  data: MarketDataQuery_marketsConnection_edges_node_data | null;
}

export interface MarketDataQuery_marketsConnection_edges {
  __typename: "MarketEdge";
  /**
   * The market
   */
  node: MarketDataQuery_marketsConnection_edges_node;
}

export interface MarketDataQuery_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: MarketDataQuery_marketsConnection_edges[];
}

export interface MarketDataQuery {
  /**
   * One or more instruments that are trading on the Vega network
   */
  marketsConnection: MarketDataQuery_marketsConnection | null;
}

export interface MarketDataQueryVariables {
  marketId: string;
}
