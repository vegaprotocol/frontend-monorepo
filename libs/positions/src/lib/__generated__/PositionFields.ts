/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PositionFields
// ====================================================

export interface PositionFields_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface PositionFields {
  __typename: "Position";
  /**
   * Realised Profit and Loss (int64)
   */
  realisedPNL: string;
  /**
   * Open volume (uint64)
   */
  openVolume: string;
  /**
   * Unrealised Profit and Loss (int64)
   */
  unrealisedPNL: string;
  /**
   * Average entry price for this position
   */
  averageEntryPrice: string;
  /**
   * RFC3339Nano time the position was updated
   */
  updatedAt: string | null;
  /**
   * Market relating to this position
   */
  market: PositionFields_market;
}
