/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: VoteButtonsQuery
// ====================================================

export interface VoteButtonsQuery_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The stake currently available for the party
   */
  currentStakeAvailable: string;
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
  stakingSummary: VoteButtonsQuery_party_stakingSummary;
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
