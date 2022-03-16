/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderType, Side, OrderStatus, OrderTimeInForce } from "./../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: OrderFields
// ====================================================

export interface OrderFields_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
}

export interface OrderFields_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: OrderFields_market_tradableInstrument_instrument;
}

export interface OrderFields_market {
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: OrderFields_market_tradableInstrument;
}

export interface OrderFields {
  __typename: "Order";
  /**
   * Hash of the order data
   */
  id: string;
  /**
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  market: OrderFields_market | null;
  /**
   * Type the order type (defaults to PARTY)
   */
  type: OrderType | null;
  /**
   * Whether the order is to buy or sell
   */
  side: Side;
  /**
   * Total number of contracts that may be bought or sold (immutable) (uint64)
   */
  size: string;
  /**
   * The status of an order, for example 'Active'
   */
  status: OrderStatus;
  /**
   * The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64)
   */
  price: string;
  /**
   * The timeInForce of order (determines how and if it executes, and whether it persists on the book)
   */
  timeInForce: OrderTimeInForce;
  /**
   * Number of contracts remaining of the total that have not yet been bought or sold (uint64)
   */
  remaining: string;
  /**
   * RFC3339Nano formatted date and time for when the order was created (timestamp)
   */
  createdAt: string;
  /**
   * RFC3339Nano time the order was altered
   */
  updatedAt: string | null;
}
