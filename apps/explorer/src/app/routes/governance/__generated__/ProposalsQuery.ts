/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProposalState, ProposalRejectionReason, VoteValue } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: ProposalsQuery
// ====================================================

export interface ProposalsQuery_proposalsConnection_edges_node_rationale {
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

export interface ProposalsQuery_proposalsConnection_edges_node_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateAsset {
  __typename: "UpdateAsset" | "NewFreeform";
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_NewMarket_instrument {
  __typename: "InstrumentConfiguration";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_NewMarket {
  __typename: "NewMarket";
  /**
   * New market instrument configuration
   */
  instrument: ProposalsQuery_proposalsConnection_edges_node_terms_change_NewMarket_instrument;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateMarket {
  __typename: "UpdateMarket";
  marketId: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source_BuiltinAsset {
  __typename: "BuiltinAsset";
  /**
   * Maximum amount that can be requested by a party through the built-in asset faucet at a time
   */
  maxFaucetAmountMint: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source_ERC20 {
  __typename: "ERC20";
  /**
   * The address of the ERC20 contract
   */
  contractAddress: string;
}

export type ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source = ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source_BuiltinAsset | ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source_ERC20;

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset {
  __typename: "NewAsset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The source of the new asset
   */
  source: ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset_source;
}

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateNetworkParameter_networkParameter {
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

export interface ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateNetworkParameter {
  __typename: "UpdateNetworkParameter";
  networkParameter: ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateNetworkParameter_networkParameter;
}

export type ProposalsQuery_proposalsConnection_edges_node_terms_change = ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateAsset | ProposalsQuery_proposalsConnection_edges_node_terms_change_NewMarket | ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateMarket | ProposalsQuery_proposalsConnection_edges_node_terms_change_NewAsset | ProposalsQuery_proposalsConnection_edges_node_terms_change_UpdateNetworkParameter;

export interface ProposalsQuery_proposalsConnection_edges_node_terms {
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
  change: ProposalsQuery_proposalsConnection_edges_node_terms_change;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes_party_stakingSummary;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_yes {
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
   * All votes cast for this side
   */
  votes: ProposalsQuery_proposalsConnection_edges_node_votes_yes_votes[] | null;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_no_votes_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_no_votes_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stakingSummary: ProposalsQuery_proposalsConnection_edges_node_votes_no_votes_party_stakingSummary;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_no_votes {
  __typename: "Vote";
  /**
   * The vote value cast
   */
  value: VoteValue;
  /**
   * The party casting the vote
   */
  party: ProposalsQuery_proposalsConnection_edges_node_votes_no_votes_party;
  /**
   * RFC3339Nano time and date when the vote reached Vega network
   */
  datetime: string;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes_no {
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
   * All votes cast for this side
   */
  votes: ProposalsQuery_proposalsConnection_edges_node_votes_no_votes[] | null;
}

export interface ProposalsQuery_proposalsConnection_edges_node_votes {
  __typename: "ProposalVotes";
  /**
   * Yes votes cast for this proposal
   */
  yes: ProposalsQuery_proposalsConnection_edges_node_votes_yes;
  /**
   * No votes cast for this proposal
   */
  no: ProposalsQuery_proposalsConnection_edges_node_votes_no;
}

export interface ProposalsQuery_proposalsConnection_edges_node {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by Vega once proposal reaches the network
   */
  id: string | null;
  /**
   * Rationale behind the proposal
   */
  rationale: ProposalsQuery_proposalsConnection_edges_node_rationale;
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
   * Reason for the proposal to be rejected by the core
   */
  rejectionReason: ProposalRejectionReason | null;
  /**
   * Party that prepared the proposal
   */
  party: ProposalsQuery_proposalsConnection_edges_node_party;
  /**
   * Terms of the proposal
   */
  terms: ProposalsQuery_proposalsConnection_edges_node_terms;
  /**
   * Votes cast for this proposal
   */
  votes: ProposalsQuery_proposalsConnection_edges_node_votes;
}

export interface ProposalsQuery_proposalsConnection_edges {
  __typename: "ProposalEdge";
  /**
   * The proposal data
   */
  node: ProposalsQuery_proposalsConnection_edges_node;
}

export interface ProposalsQuery_proposalsConnection {
  __typename: "ProposalsConnection";
  /**
   * List of proposals available for the connection
   */
  edges: (ProposalsQuery_proposalsConnection_edges | null)[] | null;
}

export interface ProposalsQuery {
  /**
   * All governance proposals in the Vega network
   */
  proposalsConnection: ProposalsQuery_proposalsConnection | null;
}
