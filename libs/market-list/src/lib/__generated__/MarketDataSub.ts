/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode, AuctionTrigger } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: MarketDataSub
// ====================================================

export interface MarketDataSub_marketsData {
  __typename: "ObservableMarketData";
  /**
   * market ID of the associated mark price
   */
  marketId: string;
  /**
   * current state of the market
   */
  marketState: MarketState;
  /**
   * what mode the market is in (auction, continuous etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * the mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * what triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
}

export interface MarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketsData: MarketDataSub_marketsData[];
}

export interface MarketDataSubVariables {
  marketIds: string[];
}
