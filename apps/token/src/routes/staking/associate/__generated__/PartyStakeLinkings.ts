/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StakeLinkingStatus } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: PartyStakeLinkings
// ====================================================

export interface PartyStakeLinkings_party_stakingSummary_linkings_edges_node {
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

export interface PartyStakeLinkings_party_stakingSummary_linkings_edges {
  __typename: "StakeLinkingEdge";
  /**
   * The stake linking
   */
  node: PartyStakeLinkings_party_stakingSummary_linkings_edges_node;
}

export interface PartyStakeLinkings_party_stakingSummary_linkings {
  __typename: "StakesConnection";
  /**
   * List of stake links available for the connection
   */
  edges: (PartyStakeLinkings_party_stakingSummary_linkings_edges | null)[] | null;
}

export interface PartyStakeLinkings_party_stakingSummary {
  __typename: "StakingSummary";
  /**
   * The list of all stake link/unlink for the party
   */
  linkings: PartyStakeLinkings_party_stakingSummary_linkings;
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
  stakingSummary: PartyStakeLinkings_party_stakingSummary;
}

export interface PartyStakeLinkings {
  /**
   * An entity that is trading on the Vega network
   */
  party: PartyStakeLinkings_party | null;
}

export interface PartyStakeLinkingsVariables {
  partyId: string;
}
