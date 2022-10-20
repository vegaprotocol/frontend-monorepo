/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProposalState, ProposalRejectionReason, VoteValue } from "@vegaprotocol/types";

// ====================================================
// GraphQL fragment: ProposalFields
// ====================================================

export interface ProposalFields_rationale {
  __typename: "ProposalRationale";
  /**
   * Title to be used to give a short description of the proposal in lists.
   * This is to be between 0 and 100 unicode characters.
   * This is mandatory for all proposals.
   */
  title: string;
  /**
   * Description to show a short title / something in case the link goes offline.
   * This is to be between 0 and 20k unicode characters.
   * This is mandatory for all proposals.
   */
  description: string;
}

export interface ProposalFields_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface ProposalFields_terms_change_NewFreeform {
  __typename: "NewFreeform";
}

export interface ProposalFields_terms_change_NewMarket_instrument_futureProduct_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface ProposalFields_terms_change_NewMarket_instrument_futureProduct {
  __typename: "FutureProduct";
  /**
   * Product asset
   */
  settlementAsset: ProposalFields_terms_change_NewMarket_instrument_futureProduct_settlementAsset;
}

export interface ProposalFields_terms_change_NewMarket_instrument {
  __typename: "InstrumentConfiguration";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18)
   */
  code: string;
  /**
   * Future product specification
   */
  futureProduct: ProposalFields_terms_change_NewMarket_instrument_futureProduct | null;
}

export interface ProposalFields_terms_change_NewMarket {
  __typename: "NewMarket";
  /**
   * New market instrument configuration
   */
  instrument: ProposalFields_terms_change_NewMarket_instrument;
}

export interface ProposalFields_terms_change_UpdateMarket {
  __typename: "UpdateMarket";
  marketId: string;
}

export interface ProposalFields_terms_change_NewAsset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export interface ProposalFields_terms_change_NewAsset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export type ProposalFields_terms_change_NewAsset_source = ProposalFields_terms_change_NewAsset_source_BuiltinAsset | ProposalFields_terms_change_NewAsset_source_ERC20;

export interface ProposalFields_terms_change_NewAsset {
  __typename: "NewAsset";
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The source of the new asset
   */
  source: ProposalFields_terms_change_NewAsset_source;
}

export interface ProposalFields_terms_change_UpdateNetworkParameter_networkParameter {
  __typename: "NetworkParameter";
  /**
   * The name of the network parameter
   */
  key: string;
  /**
   * The value of the network parameter
   */
  value: string;
}

export interface ProposalFields_terms_change_UpdateNetworkParameter {
  __typename: "UpdateNetworkParameter";
  networkParameter: ProposalFields_terms_change_UpdateNetworkParameter_networkParameter;
}

export interface ProposalFields_terms_change_UpdateAsset_source {
  __typename: "UpdateERC20";
  /**
   * The lifetime limits deposit per address
   * Note: this is a temporary measure for alpha mainnet
   */
  lifetimeLimit: string;
  /**
   * The maximum allowed per withdrawal
   * Note: this is a temporary measure for alpha mainnet
   */
  withdrawThreshold: string;
}

export interface ProposalFields_terms_change_UpdateAsset {
  __typename: "UpdateAsset";
  /**
   * The minimum economically meaningful amount of this specific asset
   */
  quantum: string;
  /**
   * The asset to update
   */
  assetId: string;
  /**
   * The source of the updated asset
   */
  source: ProposalFields_terms_change_UpdateAsset_source;
}

export type ProposalFields_terms_change = ProposalFields_terms_change_NewFreeform | ProposalFields_terms_change_NewMarket | ProposalFields_terms_change_UpdateMarket | ProposalFields_terms_change_NewAsset | ProposalFields_terms_change_UpdateNetworkParameter | ProposalFields_terms_change_UpdateAsset;

export interface ProposalFields_terms {
  __typename: "ProposalTerms";
  /**
   * RFC3339Nano time and date when voting closes for this proposal.
   * Constrained by "minClose" and "maxClose" network parameters.
   */
  closingDatetime: string;
  /**
   * RFC3339Nano time and date when this proposal is executed (if passed). Note that it has to be after closing date time.
   * Constrained by "minEnactInSeconds" and "maxEnactInSeconds" network parameters.
   * Note: Optional as free form proposals do not require it.
   */
  enactmentDatetime: string | null;
  /**
   * Actual change being introduced by the proposal - action the proposal triggers if passed and enacted.
   */
  change: ProposalFields_terms_change;
}

export interface ProposalFields_votes_yes_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface ProposalFields_votes_yes_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: ProposalFields_votes_yes_votes_party_stakingSummary;
}

export interface ProposalFields_votes_yes_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: ProposalFields_votes_yes_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface ProposalFields_votes_yes {
  __typename: "ProposalVoteSide";
  /**
   * Total number of governance tokens from the votes cast for this side
   */
  totalTokens: string;
  /**
   * Total number of votes cast for this side
   */
  totalNumber: string;
  /**
   * Total equity like share weight for this side (only for UpdateMarket Proposals)
   */
  totalEquityLikeShareWeight: string;
  /**
   * All votes cast for this side
   */
  votes: ProposalFields_votes_yes_votes[] | null;
}

export interface ProposalFields_votes_no_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface ProposalFields_votes_no_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: ProposalFields_votes_no_votes_party_stakingSummary;
}

export interface ProposalFields_votes_no_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: ProposalFields_votes_no_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface ProposalFields_votes_no {
  __typename: "ProposalVoteSide";
  /**
   * Total number of governance tokens from the votes cast for this side
   */
  totalTokens: string;
  /**
   * Total number of votes cast for this side
   */
  totalNumber: string;
  /**
   * Total equity like share weight for this side (only for UpdateMarket Proposals)
   */
  totalEquityLikeShareWeight: string;
  /**
   * All votes cast for this side
   */
  votes: ProposalFields_votes_no_votes[] | null;
}

export interface ProposalFields_votes {
  __typename: "ProposalVotes";
  /**
   * Yes votes cast for this proposal
   */
  yes: ProposalFields_votes_yes;
  /**
   * No votes cast for this proposal
   */
  no: ProposalFields_votes_no;
}

export interface ProposalFields {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by Vega once proposal reaches the network
   */
  id: string | null;
  /**
   * Rationale behind the proposal
   */
  rationale: ProposalFields_rationale;
  /**
   * A UUID reference to aid tracking proposals on Vega
   */
  reference: string;
  /**
   * State of the proposal
   */
  state: ProposalState;
  /**
   * RFC3339Nano time and date when the proposal reached Vega network
   */
  datetime: string;
  /**
   * Why the proposal was rejected by the core
   */
  rejectionReason: ProposalRejectionReason | null;
  /**
   * Party that prepared the proposal
   */
  party: ProposalFields_party;
  /**
   * Error details of the rejectionReason
   */
  errorDetails: string | null;
  /**
   * Terms of the proposal
   */
  terms: ProposalFields_terms;
  /**
   * Votes cast for this proposal
   */
  votes: ProposalFields_votes;
}
