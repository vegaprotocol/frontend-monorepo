/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  BusEventType,
  OrderType,
  OrderStatus,
  OrderRejectionReason,
} from './../../__generated__/globalTypes';

// ====================================================
// GraphQL subscription operation: OrderEvent
// ====================================================

export interface OrderEvent_busEvents_event_TimeUpdate {
  __typename:
    | 'TimeUpdate'
    | 'MarketEvent'
    | 'TransferResponses'
    | 'PositionResolution'
    | 'Trade'
    | 'Account'
    | 'Party'
    | 'MarginLevels'
    | 'Proposal'
    | 'Vote'
    | 'MarketData'
    | 'NodeSignature'
    | 'LossSocialization'
    | 'SettlePosition'
    | 'Market'
    | 'Asset'
    | 'MarketTick'
    | 'SettleDistressed'
    | 'AuctionEvent'
    | 'RiskFactor'
    | 'Deposit'
    | 'Withdrawal'
    | 'OracleSpec'
    | 'LiquidityProvision';
}

export interface OrderEvent_busEvents_event_Order_market {
  __typename: 'Market';
  /**
   * Market full name
   */
  name: string;
}

export interface OrderEvent_busEvents_event_Order {
  __typename: 'Order';
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
   * The market the order is trading on (probably stored internally as a hash of the market details)
   */
  market: OrderEvent_busEvents_event_Order_market | null;
}

export type OrderEvent_busEvents_event =
  | OrderEvent_busEvents_event_TimeUpdate
  | OrderEvent_busEvents_event_Order;

export interface OrderEvent_busEvents {
  __typename: 'BusEvent';
  /**
   * the id for this event
   */
  eventId: string;
  /**
   * the block hash
   */
  block: string;
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
