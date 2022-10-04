/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: MarginsSubscription
// ====================================================

export interface MarginsSubscription_margins {
  __typename: "MarginLevelsUpdate";
  /**
   * Market in which the margin is required for this party
   */
  marketId: string;
  /**
   * Asset for the current margins
   */
  asset: string;
  /**
   * The party for this margin
   */
  partyId: string;
  /**
   * Minimal margin for the position to be maintained in the network (unsigned integer)
   */
  maintenanceLevel: string;
  /**
   * If the margin is between maintenance and search, the network will initiate a collateral search (unsigned integer)
   */
  searchLevel: string;
  /**
   * This is the minimum margin required for a party to place a new order on the network (unsigned integer)
   */
  initialLevel: string;
  /**
   * If the margin of the party is greater than this level, then collateral will be released from the margin account into
   * the general account of the party for the given asset.
   */
  collateralReleaseLevel: string;
  /**
   * RFC3339Nano time from at which this margin level was relevant
   */
  timestamp: string;
}

export interface MarginsSubscription {
  /**
   * Subscribe to the margin changes
   */
  margins: MarginsSubscription_margins;
}

export interface MarginsSubscriptionVariables {
  partyId: string;
}
