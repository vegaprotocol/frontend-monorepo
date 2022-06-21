/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Pagination } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Fills
// ====================================================

export interface Fills_party_tradesPaged_edges_node_buyer {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Fills_party_tradesPaged_edges_node_seller {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Fills_party_tradesPaged_edges_node_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
}

export interface Fills_party_tradesPaged_edges_node_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: Fills_party_tradesPaged_edges_node_market_tradableInstrument_instrument;
}

export interface Fills_party_tradesPaged_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market. (uint64)
   * 
   * Examples:
   * Currency     Balance  decimalPlaces  Real Balance
   * GBP              100              0       GBP 100
   * GBP              100              2       GBP   1.00
   * GBP              100              4       GBP   0.01
   * GBP                1              4       GBP   0.0001   (  0.01p  )
   * 
   * GBX (pence)      100              0       GBP   1.00     (100p     )
   * GBX (pence)      100              2       GBP   0.01     (  1p     )
   * GBX (pence)      100              4       GBP   0.0001   (  0.01p  )
   * GBX (pence)        1              4       GBP   0.000001 (  0.0001p)
   */
  decimalPlaces: number;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: Fills_party_tradesPaged_edges_node_market_tradableInstrument;
}

export interface Fills_party_tradesPaged_edges_node {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
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
   * The party that bought
   */
  buyer: Fills_party_tradesPaged_edges_node_buyer;
  /**
   * The party that sold
   */
  seller: Fills_party_tradesPaged_edges_node_seller;
  /**
   * The market the trade occurred on
   */
  market: Fills_party_tradesPaged_edges_node_market;
}

export interface Fills_party_tradesPaged_edges {
  __typename: "TradeEdge";
  node: Fills_party_tradesPaged_edges_node;
  cursor: string;
}

export interface Fills_party_tradesPaged_pageInfo {
  __typename: "PageInfo";
  startCursor: string;
  endCursor: string;
}

export interface Fills_party_tradesPaged {
  __typename: "TradeConnection";
  /**
   * The total number of trades in this connection
   */
  totalCount: number;
  /**
   * The trade in this connection
   */
  edges: Fills_party_tradesPaged_edges[];
  /**
   * The pagination information
   */
  pageInfo: Fills_party_tradesPaged_pageInfo;
}

export interface Fills_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  tradesPaged: Fills_party_tradesPaged;
}

export interface Fills {
  /**
   * An entity that is trading on the VEGA network
   */
  party: Fills_party | null;
}

export interface FillsVariables {
  partyId: string;
  marketId?: string | null;
  pagination?: Pagination | null;
}
