/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BusEventType {
  Account = 'Account',
  Asset = 'Asset',
  Auction = 'Auction',
  Deposit = 'Deposit',
  LiquidityProvision = 'LiquidityProvision',
  LossSocialization = 'LossSocialization',
  MarginLevels = 'MarginLevels',
  Market = 'Market',
  MarketCreated = 'MarketCreated',
  MarketData = 'MarketData',
  MarketTick = 'MarketTick',
  MarketUpdated = 'MarketUpdated',
  NodeSignature = 'NodeSignature',
  OracleSpec = 'OracleSpec',
  Order = 'Order',
  Party = 'Party',
  PositionResolution = 'PositionResolution',
  Proposal = 'Proposal',
  RiskFactor = 'RiskFactor',
  SettleDistressed = 'SettleDistressed',
  SettlePosition = 'SettlePosition',
  TimeUpdate = 'TimeUpdate',
  Trade = 'Trade',
  TransferResponses = 'TransferResponses',
  Vote = 'Vote',
  Withdrawal = 'Withdrawal',
}

/**
 * The current state of a market
 */
export enum MarketState {
  Active = 'Active',
  Cancelled = 'Cancelled',
  Closed = 'Closed',
  Pending = 'Pending',
  Proposed = 'Proposed',
  Rejected = 'Rejected',
  Settled = 'Settled',
  Suspended = 'Suspended',
  TradingTerminated = 'TradingTerminated',
}

/**
 * What market trading mode are we in
 */
export enum MarketTradingMode {
  BatchAuction = 'BatchAuction',
  Continuous = 'Continuous',
  MonitoringAuction = 'MonitoringAuction',
  OpeningAuction = 'OpeningAuction',
}

/**
 * Reason for the order being rejected by the core node
 */
export enum OrderRejectionReason {
  AmendToGTTWithoutExpiryAt = 'AmendToGTTWithoutExpiryAt',
  CannotAmendFromGFAOrGFN = 'CannotAmendFromGFAOrGFN',
  CannotAmendPeggedOrderDetailsOnNonPeggedOrder = 'CannotAmendPeggedOrderDetailsOnNonPeggedOrder',
  CannotAmendToFOKOrIOC = 'CannotAmendToFOKOrIOC',
  CannotAmendToGFAOrGFN = 'CannotAmendToGFAOrGFN',
  EditNotAllowed = 'EditNotAllowed',
  ExpiryAtBeforeCreatedAt = 'ExpiryAtBeforeCreatedAt',
  FOKOrderDuringAuction = 'FOKOrderDuringAuction',
  GFAOrderDuringContinuousTrading = 'GFAOrderDuringContinuousTrading',
  GFNOrderDuringAuction = 'GFNOrderDuringAuction',
  GTCWithExpiryAtNotValid = 'GTCWithExpiryAtNotValid',
  IOCOrderDuringAuction = 'IOCOrderDuringAuction',
  InsufficientAssetBalance = 'InsufficientAssetBalance',
  InsufficientFundsToPayFees = 'InsufficientFundsToPayFees',
  InternalError = 'InternalError',
  InvalidExpirationTime = 'InvalidExpirationTime',
  InvalidMarketId = 'InvalidMarketId',
  InvalidMarketType = 'InvalidMarketType',
  InvalidOrderId = 'InvalidOrderId',
  InvalidOrderReference = 'InvalidOrderReference',
  InvalidPartyId = 'InvalidPartyId',
  InvalidPersistence = 'InvalidPersistence',
  InvalidRemainingSize = 'InvalidRemainingSize',
  InvalidSize = 'InvalidSize',
  InvalidTimeInForce = 'InvalidTimeInForce',
  InvalidType = 'InvalidType',
  MarginCheckFailed = 'MarginCheckFailed',
  MarketClosed = 'MarketClosed',
  MissingGeneralAccount = 'MissingGeneralAccount',
  NonPersistentOrderExceedsPriceBounds = 'NonPersistentOrderExceedsPriceBounds',
  OrderAmendFailure = 'OrderAmendFailure',
  OrderNotFound = 'OrderNotFound',
  OrderOutOfSequence = 'OrderOutOfSequence',
  OrderRemovalFailure = 'OrderRemovalFailure',
  PeggedOrderBuyCannotReferenceBestAskPrice = 'PeggedOrderBuyCannotReferenceBestAskPrice',
  PeggedOrderMustBeGTTOrGTC = 'PeggedOrderMustBeGTTOrGTC',
  PeggedOrderMustBeLimitOrder = 'PeggedOrderMustBeLimitOrder',
  PeggedOrderOffsetMustBeGreaterOrEqualToZero = 'PeggedOrderOffsetMustBeGreaterOrEqualToZero',
  PeggedOrderOffsetMustBeGreaterThanZero = 'PeggedOrderOffsetMustBeGreaterThanZero',
  PeggedOrderSellCannotReferenceBestBidPrice = 'PeggedOrderSellCannotReferenceBestBidPrice',
  PeggedOrderWithoutReferencePrice = 'PeggedOrderWithoutReferencePrice',
  SelfTrading = 'SelfTrading',
  TimeFailure = 'TimeFailure',
  UnableToAmendPeggedOrderPrice = 'UnableToAmendPeggedOrderPrice',
  UnableToRepricePeggedOrder = 'UnableToRepricePeggedOrder',
}

/**
 * Valid order statuses, these determine several states for an order that cannot be expressed with other fields in Order.
 */
export enum OrderStatus {
  Active = 'Active',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
  Filled = 'Filled',
  Parked = 'Parked',
  PartiallyFilled = 'PartiallyFilled',
  Rejected = 'Rejected',
  Stopped = 'Stopped',
}

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
  Network = 'Network',
}

//==============================================================
// END Enums and Input Objects
//==============================================================
