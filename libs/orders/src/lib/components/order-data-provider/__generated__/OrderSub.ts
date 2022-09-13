/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderType, Side, OrderStatus, OrderRejectionReason, OrderTimeInForce } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: OrderSub
// ====================================================

export interface OrderSub_orders {
  __typename: "OrderUpdate";
  /**
   * Hash of the order data
   */
  id: string;
  /**
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  marketId: string;
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

export interface OrderSub {
  /**
   * Subscribe to orders updates
   */
  orders: OrderSub_orders[] | null;
}

export interface OrderSubVariables {
  partyId: string;
}
