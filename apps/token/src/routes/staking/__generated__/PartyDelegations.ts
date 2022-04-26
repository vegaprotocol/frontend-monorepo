/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PartyDelegations
// ====================================================

export interface PartyDelegations_party_delegations_node {
  __typename: "Node";
  /**
   * The node url eg n01.vega.xyz
   */
  id: string;
}

export interface PartyDelegations_party_delegations {
  __typename: "Delegation";
  /**
   * Amount delegated
   */
  amount: string;
  amountFormatted: string;
  /**
   * URL of node you are delegating to
   */
  node: PartyDelegations_party_delegations_node;
  /**
   * Epoch of delegation
   */
  epoch: number;
}

export interface PartyDelegations_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
  delegations: PartyDelegations_party_delegations[] | null;
}

export interface PartyDelegations_epoch {
  __typename: "Epoch";
  /**
   * Presumably this is an integer or something. If there's no such thing, disregard
   */
  id: string;
}

export interface PartyDelegations {
  /**
   * An entity that is trading on the VEGA network
   */
  party: PartyDelegations_party | null;
  /**
   * get data for a specific epoch, if id omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: PartyDelegations_epoch;
}

export interface PartyDelegationsVariables {
  partyId: string;
}
