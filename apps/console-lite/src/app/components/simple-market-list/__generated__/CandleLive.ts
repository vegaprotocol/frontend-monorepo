/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: CandleLive
// ====================================================

export interface CandleLive_candles {
  __typename: "Candle";
  /**
   * Close price (uint64)
   */
  close: string;
}

export interface CandleLive {
  /**
   * Subscribe to the candles updates
   */
  candles: CandleLive_candles;
}

export interface CandleLiveVariables {
  marketId: string;
}
