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
  Bond = 'Bond',
  FeeInfrastructure = 'FeeInfrastructure',
  FeeLiquidity = 'FeeLiquidity',
  General = 'General',
  GlobalInsurance = 'GlobalInsurance',
  Insurance = 'Insurance',
  LockWithdraw = 'LockWithdraw',
  Margin = 'Margin',
  Settlement = 'Settlement',
}

export enum AuctionTrigger {
  Batch = 'Batch',
  Liquidity = 'Liquidity',
  Opening = 'Opening',
  Price = 'Price',
  Unspecified = 'Unspecified',
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

export enum NodeStatus {
  NonValidator = 'NonValidator',
  Validator = 'Validator',
}

/**
 * Reason for the proposal being rejected by the core node
 */
export enum ProposalRejectionReason {
  CloseTimeTooLate = 'CloseTimeTooLate',
  CloseTimeTooSoon = 'CloseTimeTooSoon',
  CouldNotInstantiateMarket = 'CouldNotInstantiateMarket',
  EnactTimeTooLate = 'EnactTimeTooLate',
  EnactTimeTooSoon = 'EnactTimeTooSoon',
  IncompatibleTimestamps = 'IncompatibleTimestamps',
  InsufficientTokens = 'InsufficientTokens',
  InvalidAsset = 'InvalidAsset',
  InvalidAssetDetails = 'InvalidAssetDetails',
  InvalidFeeAmount = 'InvalidFeeAmount',
  InvalidFutureMaturityTimestamp = 'InvalidFutureMaturityTimestamp',
  InvalidFutureProduct = 'InvalidFutureProduct',
  InvalidInstrumentSecurity = 'InvalidInstrumentSecurity',
  InvalidRiskParameter = 'InvalidRiskParameter',
  InvalidShape = 'InvalidShape',
  MajorityThresholdNotReached = 'MajorityThresholdNotReached',
  MarketMissingLiquidityCommitment = 'MarketMissingLiquidityCommitment',
  MissingBuiltinAssetField = 'MissingBuiltinAssetField',
  MissingCommitmentAmount = 'MissingCommitmentAmount',
  MissingERC20ContractAddress = 'MissingERC20ContractAddress',
  NetworkParameterInvalidKey = 'NetworkParameterInvalidKey',
  NetworkParameterInvalidValue = 'NetworkParameterInvalidValue',
  NetworkParameterValidationFailed = 'NetworkParameterValidationFailed',
  NoProduct = 'NoProduct',
  NoRiskParameters = 'NoRiskParameters',
  NoTradingMode = 'NoTradingMode',
  NodeValidationFailed = 'NodeValidationFailed',
  OpeningAuctionDurationTooLarge = 'OpeningAuctionDurationTooLarge',
  OpeningAuctionDurationTooSmall = 'OpeningAuctionDurationTooSmall',
  ParticipationThresholdNotReached = 'ParticipationThresholdNotReached',
  ProductMaturityIsPassed = 'ProductMaturityIsPassed',
  UnsupportedProduct = 'UnsupportedProduct',
  UnsupportedTradingMode = 'UnsupportedTradingMode',
}

/**
 * Various states a proposal can transition through:
 * Open ->
 * - Passed -> Enacted.
 * - Rejected.
 * Proposal can enter Failed state from any other state.
 */
export enum ProposalState {
  Declined = 'Declined',
  Enacted = 'Enacted',
  Failed = 'Failed',
  Open = 'Open',
  Passed = 'Passed',
  Rejected = 'Rejected',
  WaitingForNodeVote = 'WaitingForNodeVote',
}

export enum VoteValue {
  No = 'No',
  Yes = 'Yes',
}

//==============================================================
// END Enums and Input Objects
//==============================================================
