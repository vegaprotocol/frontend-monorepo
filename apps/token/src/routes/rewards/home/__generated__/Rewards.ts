/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Rewards
// ====================================================

export interface Rewards_epoch_timestamps {
  __typename: "EpochTimestamps";
  /**
   * RFC3339 timestamp - Vega time of epoch start, null if not started
   */
  start: string | null;
  /**
   * RFC3339 timestamp - Vega time of epoch end, null if not ended
   */
  end: string | null;
  /**
   * RFC3339 timestamp - Vega time of epoch expiry
   */
  expiry: string | null;
}

export interface Rewards_epoch {
  __typename: "Epoch";
  /**
   * Presumably this is an integer or something. If there's no such thing, disregard
   */
  id: string;
  /**
   * Timestamps for start/end etc
   */
  timestamps: Rewards_epoch_timestamps;
}

export interface Rewards {
  /**
   * get data for a specific epoch, if id omitted it gets the current epoch. If the string is 'next', fetch the next epoch
   */
  epoch: Rewards_epoch;
}

export interface RewardsVariables {
  partyId: string;
}
