/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * The various account types we have (used by collateral)
 */
export enum AccountType {
  Bond = "Bond",
  External = "External",
  FeeInfrastructure = "FeeInfrastructure",
  FeeLiquidity = "FeeLiquidity",
  FeeMaker = "FeeMaker",
  General = "General",
  GlobalInsurance = "GlobalInsurance",
  GlobalReward = "GlobalReward",
  Insurance = "Insurance",
  LockWithdraw = "LockWithdraw",
  Margin = "Margin",
  PendingTransfers = "PendingTransfers",
  RewardLpReceivedFees = "RewardLpReceivedFees",
  RewardMakerReceivedFees = "RewardMakerReceivedFees",
  RewardMarketProposers = "RewardMarketProposers",
  RewardTakerPaidFees = "RewardTakerPaidFees",
  Settlement = "Settlement",
}

export enum AuctionTrigger {
  Batch = "Batch",
  Liquidity = "Liquidity",
  Opening = "Opening",
  Price = "Price",
  Unspecified = "Unspecified",
}

export enum BusEventType {
  Account = "Account",
  Asset = "Asset",
  Auction = "Auction",
  Deposit = "Deposit",
  LiquidityProvision = "LiquidityProvision",
  LossSocialization = "LossSocialization",
  MarginLevels = "MarginLevels",
  Market = "Market",
  MarketCreated = "MarketCreated",
  MarketData = "MarketData",
  MarketTick = "MarketTick",
  MarketUpdated = "MarketUpdated",
  NodeSignature = "NodeSignature",
  OracleSpec = "OracleSpec",
  Order = "Order",
  Party = "Party",
  PositionResolution = "PositionResolution",
  Proposal = "Proposal",
  RiskFactor = "RiskFactor",
  SettleDistressed = "SettleDistressed",
  SettlePosition = "SettlePosition",
  TimeUpdate = "TimeUpdate",
  Trade = "Trade",
  TransferResponses = "TransferResponses",
  Vote = "Vote",
  Withdrawal = "Withdrawal",
}

/**
 * Comparator describes the type of comparison.
 */
export enum ConditionOperator {
  OperatorEquals = "OperatorEquals",
  OperatorGreaterThan = "OperatorGreaterThan",
  OperatorGreaterThanOrEqual = "OperatorGreaterThanOrEqual",
  OperatorLessThan = "OperatorLessThan",
  OperatorLessThanOrEqual = "OperatorLessThanOrEqual",
}

/**
 * The status of a deposit
 */
export enum DepositStatus {
  Cancelled = "Cancelled",
  Finalized = "Finalized",
  Open = "Open",
}

/**
 * The interval for trade candles when subscribing via VEGA graphql, default is I15M
 */
export enum Interval {
  I15M = "I15M",
  I1D = "I1D",
  I1H = "I1H",
  I1M = "I1M",
  I5M = "I5M",
  I6H = "I6H",
}

/**
 * Status of a liquidity provision order
 */
export enum LiquidityProvisionStatus {
  Active = "Active",
  Cancelled = "Cancelled",
  Pending = "Pending",
  Rejected = "Rejected",
  Stopped = "Stopped",
  Undeployed = "Undeployed",
}

/**
 * The current state of a market
 */
export enum MarketState {
  Active = "Active",
  Cancelled = "Cancelled",
  Closed = "Closed",
  Pending = "Pending",
  Proposed = "Proposed",
  Rejected = "Rejected",
  Settled = "Settled",
  Suspended = "Suspended",
  TradingTerminated = "TradingTerminated",
}

/**
 * What market trading mode are we in
 */
export enum MarketTradingMode {
  BatchAuction = "BatchAuction",
  Continuous = "Continuous",
  MonitoringAuction = "MonitoringAuction",
  NoTrading = "NoTrading",
  OpeningAuction = "OpeningAuction",
}

export enum NodeStatus {
  NonValidator = "NonValidator",
  Validator = "Validator",
}

/**
 * Status describe the status of the oracle spec
 */
export enum OracleSpecStatus {
  StatusActive = "StatusActive",
  StatusUnused = "StatusUnused",
}

/**
 * Reason for the order being rejected by the core node
 */
export enum OrderRejectionReason {
  AmendToGTTWithoutExpiryAt = "AmendToGTTWithoutExpiryAt",
  CannotAmendFromGFAOrGFN = "CannotAmendFromGFAOrGFN",
  CannotAmendPeggedOrderDetailsOnNonPeggedOrder = "CannotAmendPeggedOrderDetailsOnNonPeggedOrder",
  CannotAmendToFOKOrIOC = "CannotAmendToFOKOrIOC",
  CannotAmendToGFAOrGFN = "CannotAmendToGFAOrGFN",
  EditNotAllowed = "EditNotAllowed",
  ExpiryAtBeforeCreatedAt = "ExpiryAtBeforeCreatedAt",
  FOKOrderDuringAuction = "FOKOrderDuringAuction",
  GFAOrderDuringContinuousTrading = "GFAOrderDuringContinuousTrading",
  GFNOrderDuringAuction = "GFNOrderDuringAuction",
  GTCWithExpiryAtNotValid = "GTCWithExpiryAtNotValid",
  IOCOrderDuringAuction = "IOCOrderDuringAuction",
  InsufficientAssetBalance = "InsufficientAssetBalance",
  InsufficientFundsToPayFees = "InsufficientFundsToPayFees",
  InternalError = "InternalError",
  InvalidExpirationTime = "InvalidExpirationTime",
  InvalidMarketId = "InvalidMarketId",
  InvalidMarketType = "InvalidMarketType",
  InvalidOrderId = "InvalidOrderId",
  InvalidOrderReference = "InvalidOrderReference",
  InvalidPartyId = "InvalidPartyId",
  InvalidPersistence = "InvalidPersistence",
  InvalidRemainingSize = "InvalidRemainingSize",
  InvalidSize = "InvalidSize",
  InvalidTimeInForce = "InvalidTimeInForce",
  InvalidType = "InvalidType",
  MarginCheckFailed = "MarginCheckFailed",
  MarketClosed = "MarketClosed",
  MissingGeneralAccount = "MissingGeneralAccount",
  NonPersistentOrderExceedsPriceBounds = "NonPersistentOrderExceedsPriceBounds",
  OrderAmendFailure = "OrderAmendFailure",
  OrderNotFound = "OrderNotFound",
  OrderOutOfSequence = "OrderOutOfSequence",
  OrderRemovalFailure = "OrderRemovalFailure",
  PeggedOrderBuyCannotReferenceBestAskPrice = "PeggedOrderBuyCannotReferenceBestAskPrice",
  PeggedOrderMustBeGTTOrGTC = "PeggedOrderMustBeGTTOrGTC",
  PeggedOrderMustBeLimitOrder = "PeggedOrderMustBeLimitOrder",
  PeggedOrderOffsetMustBeGreaterOrEqualToZero = "PeggedOrderOffsetMustBeGreaterOrEqualToZero",
  PeggedOrderOffsetMustBeGreaterThanZero = "PeggedOrderOffsetMustBeGreaterThanZero",
  PeggedOrderSellCannotReferenceBestBidPrice = "PeggedOrderSellCannotReferenceBestBidPrice",
  PeggedOrderWithoutReferencePrice = "PeggedOrderWithoutReferencePrice",
  SelfTrading = "SelfTrading",
  TimeFailure = "TimeFailure",
  UnableToAmendPeggedOrderPrice = "UnableToAmendPeggedOrderPrice",
  UnableToRepricePeggedOrder = "UnableToRepricePeggedOrder",
}

/**
 * Valid order statuses, these determine several states for an order that cannot be expressed with other fields in Order.
 */
export enum OrderStatus {
  Active = "Active",
  Cancelled = "Cancelled",
  Expired = "Expired",
  Filled = "Filled",
  Parked = "Parked",
  PartiallyFilled = "PartiallyFilled",
  Rejected = "Rejected",
  Stopped = "Stopped",
}

/**
 * Valid order types, these determine what happens when an order is added to the book
 */
export enum OrderTimeInForce {
  FOK = "FOK",
  GFA = "GFA",
  GFN = "GFN",
  GTC = "GTC",
  GTT = "GTT",
  IOC = "IOC",
}

export enum OrderType {
  Limit = "Limit",
  Market = "Market",
  Network = "Network",
}

/**
 * Type describes the type of properties that are supported by the oracle
 * engine.
 */
export enum PropertyKeyType {
  TypeBoolean = "TypeBoolean",
  TypeDecimal = "TypeDecimal",
  TypeEmpty = "TypeEmpty",
  TypeInteger = "TypeInteger",
  TypeString = "TypeString",
  TypeTimestamp = "TypeTimestamp",
}

/**
 * Reason for the proposal being rejected by the core node
 */
export enum ProposalRejectionReason {
  CloseTimeTooLate = "CloseTimeTooLate",
  CloseTimeTooSoon = "CloseTimeTooSoon",
  CouldNotInstantiateMarket = "CouldNotInstantiateMarket",
  EnactTimeTooLate = "EnactTimeTooLate",
  EnactTimeTooSoon = "EnactTimeTooSoon",
  IncompatibleTimestamps = "IncompatibleTimestamps",
  InsufficientEquityLikeShare = "InsufficientEquityLikeShare",
  InsufficientTokens = "InsufficientTokens",
  InvalidAsset = "InvalidAsset",
  InvalidAssetDetails = "InvalidAssetDetails",
  InvalidFeeAmount = "InvalidFeeAmount",
  InvalidFutureMaturityTimestamp = "InvalidFutureMaturityTimestamp",
  InvalidFutureProduct = "InvalidFutureProduct",
  InvalidInstrumentSecurity = "InvalidInstrumentSecurity",
  InvalidMarket = "InvalidMarket",
  InvalidRiskParameter = "InvalidRiskParameter",
  InvalidShape = "InvalidShape",
  MajorityThresholdNotReached = "MajorityThresholdNotReached",
  MarketMissingLiquidityCommitment = "MarketMissingLiquidityCommitment",
  MissingBuiltinAssetField = "MissingBuiltinAssetField",
  MissingCommitmentAmount = "MissingCommitmentAmount",
  MissingERC20ContractAddress = "MissingERC20ContractAddress",
  NetworkParameterInvalidKey = "NetworkParameterInvalidKey",
  NetworkParameterInvalidValue = "NetworkParameterInvalidValue",
  NetworkParameterValidationFailed = "NetworkParameterValidationFailed",
  NoProduct = "NoProduct",
  NoRiskParameters = "NoRiskParameters",
  NoTradingMode = "NoTradingMode",
  NodeValidationFailed = "NodeValidationFailed",
  OpeningAuctionDurationTooLarge = "OpeningAuctionDurationTooLarge",
  OpeningAuctionDurationTooSmall = "OpeningAuctionDurationTooSmall",
  ParticipationThresholdNotReached = "ParticipationThresholdNotReached",
  ProductMaturityIsPassed = "ProductMaturityIsPassed",
  TooManyMarketDecimalPlaces = "TooManyMarketDecimalPlaces",
  TooManyPriceMonitoringTriggers = "TooManyPriceMonitoringTriggers",
  UnsupportedProduct = "UnsupportedProduct",
  UnsupportedTradingMode = "UnsupportedTradingMode",
}

/**
 * Various states a proposal can transition through:
 * Open ->
 * - Passed -> Enacted.
 * - Rejected.
 * Proposal can enter Failed state from any other state.
 */
export enum ProposalState {
  Declined = "Declined",
  Enacted = "Enacted",
  Failed = "Failed",
  Open = "Open",
  Passed = "Passed",
  Rejected = "Rejected",
  WaitingForNodeVote = "WaitingForNodeVote",
}

/**
 * Whether the placer of an order is aiming to buy or sell on the market
 */
export enum Side {
  Buy = "Buy",
  Sell = "Sell",
}

/**
 * The status of the stake linking
 */
export enum StakeLinkingStatus {
  Accepted = "Accepted",
  Pending = "Pending",
  Rejected = "Rejected",
}

export enum VoteValue {
  No = "No",
  Yes = "Yes",
}

/**
 * The status of a withdrawal
 */
export enum WithdrawalStatus {
  Finalized = "Finalized",
  Open = "Open",
  Rejected = "Rejected",
}

/**
 * Pagination constructs to support cursor based pagination in the API
 */
export interface Pagination {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
