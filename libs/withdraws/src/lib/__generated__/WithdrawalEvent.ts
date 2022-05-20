/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { WithdrawalStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: WithdrawalEvent
// ====================================================

export interface WithdrawalEvent_busEvents_event_TimeUpdate {
  __typename: "TimeUpdate" | "MarketEvent" | "TransferResponses" | "PositionResolution" | "Order" | "Trade" | "Account" | "Party" | "MarginLevels" | "Proposal" | "Vote" | "MarketData" | "NodeSignature" | "LossSocialization" | "SettlePosition" | "Market" | "Asset" | "MarketTick" | "SettleDistressed" | "AuctionEvent" | "RiskFactor" | "Deposit" | "OracleSpec" | "LiquidityProvision";
}

export interface WithdrawalEvent_busEvents_event_Withdrawal_asset {
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

export interface WithdrawalEvent_busEvents_event_Withdrawal_details {
  __typename: "Erc20WithdrawalDetails";
  /**
   * The ethereum address of the receiver of the asset funds
   */
  receiverAddress: string;
}

export interface WithdrawalEvent_busEvents_event_Withdrawal {
  __typename: "Withdrawal";
  /**
   * The Vega internal id of the withdrawal
   */
  id: string;
  /**
   * The current status of the withdrawal
   */
  status: WithdrawalStatus;
  /**
   * The amount to be withdrawn
   */
  amount: string;
  /**
   * The asset to be withdrawn
   */
  asset: WithdrawalEvent_busEvents_event_Withdrawal_asset;
  /**
   * RFC3339Nano time at which the withdrawal was created
   */
  createdTimestamp: string;
  /**
   * RFC3339Nano time at which the withdrawal was finalized
   */
  withdrawnTimestamp: string | null;
  /**
   * Hash of the transaction on the foreign chain
   */
  txHash: string | null;
  /**
   * Foreign chain specific details about the withdrawal
   */
  details: WithdrawalEvent_busEvents_event_Withdrawal_details | null;
  /**
   * Whether or the not the withdrawal is being processed on Ethereum
   */
  pendingOnForeignChain: boolean;
}

export type WithdrawalEvent_busEvents_event = WithdrawalEvent_busEvents_event_TimeUpdate | WithdrawalEvent_busEvents_event_Withdrawal;

export interface WithdrawalEvent_busEvents {
  __typename: "BusEvent";
  /**
   * the payload - the wrapped event
   */
  event: WithdrawalEvent_busEvents_event;
}

export interface WithdrawalEvent {
  /**
   * Subscribe to event data from the event bus
   */
  busEvents: WithdrawalEvent_busEvents[] | null;
}

export interface WithdrawalEventVariables {
  partyId: string;
}
