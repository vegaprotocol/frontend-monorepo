/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProposalState, ProposalRejectionReason, VoteValue } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: Proposals
// ====================================================

export interface Proposals_proposals_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface Proposals_proposals_terms_change_NewMarket_instrument {
  __typename: "InstrumentConfiguration";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface Proposals_proposals_terms_change_NewMarket {
  __typename: "NewMarket";
  /**
   * Decimal places used for the new market
   */
  decimalPlaces: number;
  /**
   * Metadata for this instrument, tags
   */
  metadata: string[] | null;
  /**
   * New market instrument configuration
   */
  instrument: Proposals_proposals_terms_change_NewMarket_instrument;
}

export interface Proposals_proposals_terms_change_UpdateMarket {
  __typename: "UpdateMarket";
  marketId: string;
}

export interface Proposals_proposals_terms_change_NewAsset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export interface Proposals_proposals_terms_change_NewAsset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the erc20 contract
   */
  contractAddress: string;
}

export type Proposals_proposals_terms_change_NewAsset_source = Proposals_proposals_terms_change_NewAsset_source_BuiltinAsset | Proposals_proposals_terms_change_NewAsset_source_ERC20;

export interface Proposals_proposals_terms_change_NewAsset {
  __typename: "NewAsset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * the source of the new Asset
   */
  source: Proposals_proposals_terms_change_NewAsset_source;
}

export interface Proposals_proposals_terms_change_UpdateNetworkParameter_networkParameter {
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

export interface Proposals_proposals_terms_change_UpdateNetworkParameter {
  __typename: "UpdateNetworkParameter";
  networkParameter: Proposals_proposals_terms_change_UpdateNetworkParameter_networkParameter;
}

export interface Proposals_proposals_terms_change_NewFreeform {
  __typename: "NewFreeform";
  /**
   * The URL containing content that describes the proposal
   */
  url: string;
  /**
   * A short description of what is being proposed
   */
  description: string;
  /**
   * The hash on the content of the URL
   */
  hash: string;
}

export type Proposals_proposals_terms_change = Proposals_proposals_terms_change_NewMarket | Proposals_proposals_terms_change_UpdateMarket | Proposals_proposals_terms_change_NewAsset | Proposals_proposals_terms_change_UpdateNetworkParameter | Proposals_proposals_terms_change_NewFreeform;

export interface Proposals_proposals_terms {
  __typename: "ProposalTerms";
  /**
   * RFC3339Nano time and date when voting closes for this proposal.
   * Constrained by "minClose" and "maxClose" network parameters.
   */
  closingDatetime: string;
  /**
   * RFC3339Nano time and date when this proposal is executed (if passed). Note that it has to be after closing date time.
   * Constrained by "minEnactInSeconds" and "maxEnactInSeconds" network parameters.
   */
  enactmentDatetime: string;
  /**
   * Actual change being introduced by the proposal - action the proposal triggers if passed and enacted.
   */
  change: Proposals_proposals_terms_change;
}

export interface Proposals_proposals_votes_yes_votes_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface Proposals_proposals_votes_yes_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: Proposals_proposals_votes_yes_votes_party_stake;
}

export interface Proposals_proposals_votes_yes_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: Proposals_proposals_votes_yes_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface Proposals_proposals_votes_yes {
  __typename: "ProposalVoteSide";
  /**
   * Total tokens of governance token from the votes casted for this side
   */
  totalTokens: string;
  /**
   * Total number of votes casted for this side
   */
  totalNumber: string;
  /**
   * All votes casted for this side
   */
  votes: Proposals_proposals_votes_yes_votes[] | null;
}

export interface Proposals_proposals_votes_no_votes_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface Proposals_proposals_votes_no_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: Proposals_proposals_votes_no_votes_party_stake;
}

export interface Proposals_proposals_votes_no_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: Proposals_proposals_votes_no_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface Proposals_proposals_votes_no {
  __typename: "ProposalVoteSide";
  /**
   * Total tokens of governance token from the votes casted for this side
   */
  totalTokens: string;
  /**
   * Total number of votes casted for this side
   */
  totalNumber: string;
  /**
   * All votes casted for this side
   */
  votes: Proposals_proposals_votes_no_votes[] | null;
}

export interface Proposals_proposals_votes {
  __typename: "ProposalVotes";
  /**
   * Yes votes cast for this proposal
   */
  yes: Proposals_proposals_votes_yes;
  /**
   * No votes cast for this proposal
   */
  no: Proposals_proposals_votes_no;
}

export interface Proposals_proposals {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by VEGA once proposal reaches the network
   */
  id: string | null;
  /**
   * A UUID reference to aid tracking proposals on VEGA
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
   * Reason for the proposal to be rejected by the core
   */
  rejectionReason: ProposalRejectionReason | null;
  /**
   * Error details of the rejectionReason
   */
  errorDetails: string | null;
  /**
   * Party that prepared the proposal
   */
  party: Proposals_proposals_party;
  /**
   * Terms of the proposal
   */
  terms: Proposals_proposals_terms;
  /**
   * Votes cast for this proposal
   */
  votes: Proposals_proposals_votes;
}

export interface Proposals {
  /**
   * All governance proposals in the VEGA network
   */
  proposals: Proposals_proposals[] | null;
}
