/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BusEventType, OrderType, OrderStatus, OrderRejectionReason, OrderTimeInForce, Side } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: OrderEvent
// ====================================================

export interface OrderEvent_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate" | "MarketEvent" | "TransferResponses" | "PositionResolution" | "Trade" | "Account" | "Party" | "MarginLevels" | "Proposal" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Deposit" | "Withdrawal" | "OracleSpec" | "LiquidityProvision";
}

export interface OrderEvent_busEvents_event_Order_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface OrderEvent_busEvents_event_Order_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: OrderEvent_busEvents_event_Order_market_tradableInstrument_instrument;
}

export interface OrderEvent_busEvents_event_Order_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: OrderEvent_busEvents_event_Order_market_tradableInstrument;
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
}

export interface OrderEvent_busEvents_event_Order {
  __typename: "Order";
  /**
   * The order type
   */
  type: OrderType | null;
  /**
   * Hash of the order data
   */
  id: string;
  /**
   * The status of an order, for example 'Active'
   */
  status: OrderStatus;
  /**
   * Why the order was rejected
   */
  rejectionReason: OrderRejectionReason | null;
  /**
   * RFC3339Nano formatted date and time for when the order was created (timestamp)
   */
  createdAt: string;
  /**
   * Total number of units that may be bought or sold (immutable) (uint64)
   */
  size: string;
  /**
   * The worst price the order will trade at (e.g. buy for price or less, sell for price or more) (uint64)
   */
  price: string;
  /**
   * The timeInForce of order (determines how and if it executes, and whether it persists on the book)
   */
  timeInForce: OrderTimeInForce;
  /**
   * Expiration time of this order (ISO-8601 RFC3339+Nano formatted date)
   */
  expiresAt: string | null;
  /**
   * Whether the order is to buy or sell
   */
  side: Side;
  /**
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  market: OrderEvent_busEvents_event_Order_market;
}

export type OrderEvent_busEvents_event = OrderEvent_busEvents_event_TimeUpdate | OrderEvent_busEvents_event_Order;

export interface OrderEvent_busEvents {
  __typename: "BusEvent";
  /**
   * the type of event
   */
  type: BusEventType;
  /**
   * the payload - the wrapped event
   */
  event: OrderEvent_busEvents_event;
}

export interface OrderEvent {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: OrderEvent_busEvents[] | null;
}

export interface OrderEventVariables {
  partyId: string;
}
