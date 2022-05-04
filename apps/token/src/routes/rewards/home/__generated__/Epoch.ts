/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Epoch
// ====================================================

export interface Epoch_epoch_timestamps {
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

export interface Epoch_epoch {
  __typename: "Epoch";
  /**
   * Presumably this is an integer or something. If there's no such thing, disregard
   */
  id: string;
  /**
   * Timestamps for start/end etc
   */
  timestamps: Epoch_epoch_timestamps;
}

export interface Epoch {
  /**
   * get data for a specific epoch, if id omitted it gets the current epoch
   */
  epoch: Epoch_epoch;
}
