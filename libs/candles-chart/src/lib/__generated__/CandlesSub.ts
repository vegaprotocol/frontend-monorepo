/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: CandlesSub
// ====================================================

export interface CandlesSub_candles {
  __typename: "Candle";
  /**
   * RFC3339Nano formatted date and time for the candle
   */
  datetime: string;
  /**
   * High price (uint64)
   */
  high: string;
  /**
   * Low price (uint64)
   */
  low: string;
  /**
   * Open price (uint64)
   */
  open: string;
  /**
   * Close price (uint64)
   */
  close: string;
  /**
   * Volume price (uint64)
   */
  volume: string;
}

export interface CandlesSub {
  /**
   * Subscribe to the candles updates
   */
  candles: CandlesSub_candles;
}

export interface CandlesSubVariables {
  marketId: string;
  interval: Interval;
}
