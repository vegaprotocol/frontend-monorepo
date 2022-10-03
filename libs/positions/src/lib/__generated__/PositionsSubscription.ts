/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: PositionsSubscription
// ====================================================

export interface PositionsSubscription_positions {
  __typename: "PositionUpdate";
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
  marketId: string;
}

export interface PositionsSubscription {
  /**
   * Subscribe to the positions updates
   */
  positions: PositionsSubscription_positions[];
}

export interface PositionsSubscriptionVariables {
  partyId: string;
}
