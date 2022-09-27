/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AuctionTrigger, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL subscription operation: MarketDataSub
// ====================================================

export interface MarketDataSub_marketsData {
  __typename: "ObservableMarketData";
  /**
   * Market ID of the associated mark price
   */
  marketId: string;
  /**
   * The highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * The lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * The mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * What triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * The arithmetic average of the best static bid price and best static offer price
   */
  staticMidPrice: string;
  /**
   * What mode the market is in (auction, continuous etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * Indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * Indicative price if the auction ended now, 0 if not in auction mode
   */
  indicativePrice: string;
  /**
   * The highest price level on an order book for buy orders not including pegged orders.
   */
  bestStaticBidPrice: string;
  /**
   * The lowest price level on an order book for offer orders not including pegged orders
   */
  bestStaticOfferPrice: string;
}

export interface MarketDataSub {
  /**
   * Subscribe to the mark price changes
   */
  marketsData: MarketDataSub_marketsData[];
}

export interface MarketDataSubVariables {
  marketId: string;
}
