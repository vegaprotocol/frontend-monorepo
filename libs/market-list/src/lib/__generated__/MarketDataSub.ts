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
   * market ID of the associated mark price
   */
  marketId: string;
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
   * the arithmetic average of the best static bid price and best static offer price
   */
  staticMidPrice: string;
  /**
   * what mode the market is in (auction, continuous etc)
   */
  marketTradingMode: MarketTradingMode;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * indicative price if the auction ended now, 0 if not in auction mode
   */
  indicativePrice: string;
  /**
   * the highest price level on an order book for buy orders not including pegged orders.
   */
  bestStaticBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders not including pegged orders
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
