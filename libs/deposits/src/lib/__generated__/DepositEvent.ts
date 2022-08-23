/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: DepositEvent
// ====================================================

export interface DepositEvent_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate" | "MarketEvent" | "TransferResponses" | "PositionResolution" | "Order" | "Trade" | "Account" | "Party" | "MarginLevels" | "Proposal" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Withdrawal" | "OracleSpec" | "LiquidityProvision";
}

export interface DepositEvent_busEvents_event_Deposit {
  __typename: "Deposit";
  /**
   * The Vega internal ID of the deposit
   */
  id: string;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
  /**
   * The current status of the deposit
   */
  status: DepositStatus;
}

export type DepositEvent_busEvents_event = DepositEvent_busEvents_event_TimeUpdate | DepositEvent_busEvents_event_Deposit;

export interface DepositEvent_busEvents {
  __typename: "BusEvent";
  /**
   * the payload - the wrapped event
   */
  event: DepositEvent_busEvents_event;
}

export interface DepositEvent {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: DepositEvent_busEvents[] | null;
}

export interface DepositEventVariables {
  partyId: string;
}
