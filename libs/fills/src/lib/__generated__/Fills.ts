/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Pagination, Side } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Fills
// ====================================================

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

export interface Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
}

export interface Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument_product_settlementAsset;
}

export interface Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument_product;
}

export interface Fills_party_tradesConnection_edges_node_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: Fills_party_tradesConnection_edges_node_market_tradableInstrument_instrument;
}

export interface Fills_party_tradesConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Market full name
   */
  name: string;
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the market. (uint64)
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
   * positionDecimalPlaces indicates the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   * This sets how big the smallest order / position on the market can be.
   */
  positionDecimalPlaces: number;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: Fills_party_tradesConnection_edges_node_market_tradableInstrument;
}

export interface Fills_party_tradesConnection_edges_node {
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
  /**
   * The market the trade occurred on
   */
  market: Fills_party_tradesConnection_edges_node_market;
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
  tradesConnection: Fills_party_tradesConnection;
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
