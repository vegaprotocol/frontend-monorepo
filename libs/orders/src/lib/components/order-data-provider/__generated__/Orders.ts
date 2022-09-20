/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Pagination, OrderType, Side, OrderStatus, OrderRejectionReason, OrderTimeInForce } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: Orders
// ====================================================

export interface Orders_party_ordersConnection_edges_node_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface Orders_party_ordersConnection_edges_node {
  __typename: "Order";
  /**
   * Hash of the order data
   */
  id: string;
  /**
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  market: Orders_party_ordersConnection_edges_node_market;
  /**
   * The order type
   */
  type: OrderType | null;
  /**
   * Whether the order is to buy or sell
   */
  side: Side;
  /**
   * Total number of units that may be bought or sold (immutable) (uint64)
   */
  size: string;
  /**
   * The status of an order, for example 'Active'
   */
  status: OrderStatus;
  /**
   * Why the order was rejected
   */
  rejectionReason: OrderRejectionReason | null;
  /**
   * The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64)
   */
  price: string;
  /**
   * The timeInForce of order (determines how and if it executes, and whether it persists on the book)
   */
  timeInForce: OrderTimeInForce;
  /**
   * Number of units remaining of the total that have not yet been bought or sold (uint64)
   */
  remaining: string;
  /**
   * Expiration time of this order (ISO-8601 RFC3339+Nano formatted date)
   */
  expiresAt: string | null;
  /**
   * RFC3339Nano formatted date and time for when the order was created (timestamp)
   */
  createdAt: string;
  /**
   * RFC3339Nano time the order was altered
   */
  updatedAt: string | null;
}

export interface Orders_party_ordersConnection_edges {
  __typename: "OrderEdge";
  /**
   * The order
   */
  node: Orders_party_ordersConnection_edges_node;
  /**
   * The cursor for this order
   */
  cursor: string | null;
}

export interface Orders_party_ordersConnection_pageInfo {
  __typename: "PageInfo";
  /**
   * The first cursor in the current page
   */
  startCursor: string;
  /**
   * The last cursor in the current page
   */
  endCursor: string;
  /**
   * The connection has more pages to fetch when traversing forward through the connection
   */
  hasNextPage: boolean;
  /**
   * The connection has more pages to fetch when traversing backward through the connection
   */
  hasPreviousPage: boolean;
}

export interface Orders_party_ordersConnection {
  __typename: "OrderConnection";
  /**
   * The orders in this connection
   */
  edges: Orders_party_ordersConnection_edges[] | null;
  /**
   * The pagination information
   */
  pageInfo: Orders_party_ordersConnection_pageInfo | null;
}

export interface Orders_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * Orders relating to a party
   */
  ordersConnection: Orders_party_ordersConnection | null;
}

export interface Orders {
  /**
   * An entity that is trading on the Vega network
   */
  party: Orders_party | null;
}

export interface OrdersVariables {
  partyId: string;
  pagination?: Pagination | null;
}
