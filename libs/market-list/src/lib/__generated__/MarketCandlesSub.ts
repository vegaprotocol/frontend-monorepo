/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: MarketCandlesSub
// ====================================================

export interface MarketCandlesSub_candles {
  __typename: "Candle";
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

export interface MarketCandlesSub {
  /**
   * Subscribe to the candles updates
   */
  candles: MarketCandlesSub_candles;
}

export interface MarketCandlesSubVariables {
  marketId: string;
  interval: Interval;
}
