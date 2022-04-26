/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StakeLinkingStatus } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: PartyStakeLinkings
// ====================================================

export interface PartyStakeLinkings_party_stake_linkings {
  __typename: "StakeLinking";
  id: string;
  /**
   * The transaction hash (ethereum) which initiated the link/unlink
   */
  txHash: string;
  /**
   * The status of the linking
   */
  status: StakeLinkingStatus;
}

export interface PartyStakeLinkings_party_stake {
  __typename: "PartyStake";
  /**
   * The list of all stake link/unlink for the party
   */
  linkings: PartyStakeLinkings_party_stake_linkings[] | null;
}

export interface PartyStakeLinkings_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  /**
   * The staking information for this Party
   */
  stake: PartyStakeLinkings_party_stake;
}

export interface PartyStakeLinkings {
  /**
   * An entity that is trading on the VEGA network
   */
  party: PartyStakeLinkings_party | null;
}

export interface PartyStakeLinkingsVariables {
  partyId: string;
}
