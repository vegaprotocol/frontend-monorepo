/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

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
 * Whether the placer of an order is aiming to buy or sell on the market
 */
export enum Side {
  Buy = "Buy",
  Sell = "Sell",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
