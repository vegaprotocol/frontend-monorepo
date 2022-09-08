/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DepositStatus } from "./../../../../types/src/__generated__/globalTypes";

// ====================================================
// GraphQL subscription operation: DepositEventSub
// ====================================================

export interface DepositEventSub_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate" | "MarketEvent" | "TransferResponses" | "PositionResolution" | "Order" | "Trade" | "Account" | "Party" | "MarginLevels" | "Proposal" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Withdrawal" | "OracleSpec" | "LiquidityProvision";
}

export interface DepositEventSub_busEvents_event_Deposit_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The precision of the asset
   */
  decimals: number;
}

export interface DepositEventSub_busEvents_event_Deposit {
  __typename: "Deposit";
  /**
   * The Vega internal id of the deposit
   */
  id: string;
  /**
   * The current status of the deposit
   */
  status: DepositStatus;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The asset to be withdrawn
   */
  asset: DepositEventSub_busEvents_event_Deposit_asset;
  /**
   * RFC3339Nano time at which the deposit was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the deposit was finalized
   */
  creditedTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
}

export type DepositEventSub_busEvents_event = DepositEventSub_busEvents_event_TimeUpdate | DepositEventSub_busEvents_event_Deposit;

export interface DepositEventSub_busEvents {
  __typename: "BusEvent";
  /**
   * the payload - the wrapped event
   */
  event: DepositEventSub_busEvents_event;
}

export interface DepositEventSub {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: DepositEventSub_busEvents[] | null;
}

export interface DepositEventSubVariables {
  partyId: string;
}
