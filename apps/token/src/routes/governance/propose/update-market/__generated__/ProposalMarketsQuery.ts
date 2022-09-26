/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ProposalMarketsQuery
// ====================================================

export interface ProposalMarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
}

export interface ProposalMarketsQuery_marketsConnection_edges_node_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: ProposalMarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument;
}

export interface ProposalMarketsQuery_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: ProposalMarketsQuery_marketsConnection_edges_node_tradableInstrument;
}

export interface ProposalMarketsQuery_marketsConnection_edges {
  __typename: "MarketEdge";
  node: ProposalMarketsQuery_marketsConnection_edges_node;
}

export interface ProposalMarketsQuery_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: ProposalMarketsQuery_marketsConnection_edges[];
}

export interface ProposalMarketsQuery {
  marketsConnection: ProposalMarketsQuery_marketsConnection | null;
}
