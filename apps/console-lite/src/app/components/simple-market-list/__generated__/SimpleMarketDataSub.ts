/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: SimpleMarketDataSub
// ====================================================

export interface SimpleMarketDataSub_marketsData {
  __typename: "ObservableMarketData";
  /**
   * current state of the market
   */
  marketState: MarketState;
  /**
   * market ID of the associated mark price
   */
  marketId: string;
}

export interface SimpleMarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketsData: SimpleMarketDataSub_marketsData[];
}

export interface SimpleMarketDataSubVariables {
  marketIds: string[];
}
