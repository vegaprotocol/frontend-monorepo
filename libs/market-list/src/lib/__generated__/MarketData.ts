/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AuctionTrigger, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketData
// ====================================================

export interface MarketData_markets_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketData_markets_data {
  __typename: "MarketData";
  /**
   * market of the associated mark price
   */
  market: MarketData_markets_data_market;
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
   * what state the market is in (auction, continuous, etc)
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
   * the lowest price level on an order book for offer orders not including pegged orders.
   */
  bestStaticOfferPrice: string;
}

export interface MarketData_markets {
  __typename: "Market";
  /**
   * marketData for the given market
   */
  data: MarketData_markets_data | null;
}

export interface MarketData {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketData_markets[] | null;
}
