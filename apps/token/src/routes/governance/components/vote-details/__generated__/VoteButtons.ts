/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: VoteButtons
// ====================================================

export interface VoteButtons_party_stake {
  __typename: "PartyStake";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
  currentStakeAvailableFormatted: string;
}

export interface VoteButtons_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: VoteButtons_party_stake;
}

export interface VoteButtons {
  /**
   * An entity that is trading on the VEGA network
   */
  party: VoteButtons_party | null;
}

export interface VoteButtonsVariables {
  partyId: string;
}
