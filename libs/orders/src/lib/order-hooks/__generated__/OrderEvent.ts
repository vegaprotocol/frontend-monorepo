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

export interface OrderEvent_busEvents_event_Order_market {
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
}

export interface OrderEvent_busEvents_event_Order {
  __typename: "Order";
  /**
   * Type the order type (defaults to PARTY)
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
   * Reason for the order to be rejected
   */
  rejectionReason: OrderRejectionReason | null;
  /**
   * RFC3339Nano formatted date and time for when the order was created (timestamp)
   */
  createdAt: string;
  /**
   * Total number of contracts that may be bought or sold (immutable) (uint64)
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
   * Whether the order is to buy or sell
   */
  side: Side;
  /**
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  market: OrderEvent_busEvents_event_Order_market | null;
}

export type OrderEvent_busEvents_event = OrderEvent_busEvents_event_TimeUpdate | OrderEvent_busEvents_event_Order;

export interface OrderEvent_busEvents {
  __typename: "BusEvent";
  /**
   * the type of event we're dealing with
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
