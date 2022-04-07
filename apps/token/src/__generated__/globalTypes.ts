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

export enum NodeStatus {
  NonValidator = "NonValidator",
  Validator = "Validator",
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
  InsufficientTokens = "InsufficientTokens",
  InvalidAsset = "InvalidAsset",
  InvalidAssetDetails = "InvalidAssetDetails",
  InvalidFeeAmount = "InvalidFeeAmount",
  InvalidFutureMaturityTimestamp = "InvalidFutureMaturityTimestamp",
  InvalidFutureProduct = "InvalidFutureProduct",
  InvalidInstrumentSecurity = "InvalidInstrumentSecurity",
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

//==============================================================
// END Enums and Input Objects
//==============================================================
