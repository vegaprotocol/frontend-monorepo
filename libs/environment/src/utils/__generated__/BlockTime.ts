/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: BlockTime
// ====================================================

export interface BlockTime_busEvents_event_MarketEvent {
  __typename: "MarketEvent" | "TransferResponses" | "PositionResolution" | "Order" | "Trade" | "Account" | "Party" | "MarginLevels" | "Proposal" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Deposit" | "Withdrawal" | "OracleSpec" | "LiquidityProvision";
}

export interface BlockTime_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate";
  /**
   * RFC3339Nano time of new block time
   */
  timestamp: string;
}

export type BlockTime_busEvents_event = BlockTime_busEvents_event_MarketEvent | BlockTime_busEvents_event_TimeUpdate;

export interface BlockTime_busEvents {
  __typename: "BusEvent";
  /**
   * the payload - the wrapped event
   */
  event: BlockTime_busEvents_event;
}

export interface BlockTime {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: BlockTime_busEvents[] | null;
}
