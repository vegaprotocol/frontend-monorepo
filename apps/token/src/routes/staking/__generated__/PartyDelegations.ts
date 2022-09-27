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
   * The node URL eg n01.vega.xyz
   */
  id: string;
}

export interface PartyDelegations_party_delegations {
  __typename: "Delegation";
  /**
   * Amount delegated
   */
  amount: string;
  /**
   * The amount field formatted by the client
   */
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
   * Numeric sequence number used to identify the epoch
   */
  id: string;
}

export interface PartyDelegations {
  /**
   * An entity that is trading on the Vega network
   */
  party: PartyDelegations_party | null;
  /**
   * Get data for a specific epoch, if ID omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: PartyDelegations_epoch;
}

export interface PartyDelegationsVariables {
  partyId: string;
}
