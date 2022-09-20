/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BusEventType, ProposalState, ProposalRejectionReason } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: ProposalEvent
// ====================================================

export interface ProposalEvent_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate" | "MarketEvent" | "TransferResponses" | "PositionResolution" | "Order" | "Trade" | "Account" | "Party" | "MarginLevels" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Deposit" | "Withdrawal" | "OracleSpec" | "LiquidityProvision";
}

export interface ProposalEvent_busEvents_event_Proposal {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by Vega once proposal reaches the network
   */
  id: string | null;
  /**
   * A UUID reference to aid tracking proposals on Vega
   */
  reference: string;
  /**
   * State of the proposal
   */
  state: ProposalState;
  /**
   * Why the proposal was rejected by the core
   */
  rejectionReason: ProposalRejectionReason | null;
  /**
   * Error details of the rejectionReason
   */
  errorDetails: string | null;
}

export type ProposalEvent_busEvents_event = ProposalEvent_busEvents_event_TimeUpdate | ProposalEvent_busEvents_event_Proposal;

export interface ProposalEvent_busEvents {
  __typename: "BusEvent";
  /**
   * The type of event
   */
  type: BusEventType;
  /**
   * The payload - the wrapped event
   */
  event: ProposalEvent_busEvents_event;
}

export interface ProposalEvent {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: ProposalEvent_busEvents[] | null;
}

export interface ProposalEventVariables {
  partyId: string;
}
