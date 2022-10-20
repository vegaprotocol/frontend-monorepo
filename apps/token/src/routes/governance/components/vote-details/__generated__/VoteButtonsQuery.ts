/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: VoteButtonsQuery
// ====================================================

export interface VoteButtonsQuery_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
  /**
   * The currently available stake formatted by the client
   */
  currentStakeAvailableFormatted: string;
}

export interface VoteButtonsQuery_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: VoteButtonsQuery_party_stake;
}

export interface VoteButtonsQuery {
  /**
   * An entity that is trading on the Vega network
   */
  party: VoteButtonsQuery_party | null;
}

export interface VoteButtonsQueryVariables {
  partyId: string;
}
