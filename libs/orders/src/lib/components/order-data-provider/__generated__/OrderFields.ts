/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderType, Side, OrderStatus, OrderRejectionReason, OrderTimeInForce } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: OrderFields
// ====================================================

export interface OrderFields_market_tradableInstrument_instrument {
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
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface OrderFields_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
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
  market: OrderFields_market;
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
   * Reason for the order to be rejected
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
   * Number of contracts remaining of the total that have not yet been bought or sold (uint64)
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
