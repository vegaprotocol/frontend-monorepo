/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketDepth
// ====================================================

export interface MarketDepth_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketDepth_market_data {
  __typename: "MarketData";
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
  /**
   * market ID of the associated mark price
   */
  market: MarketDepth_market_data_market;
}

export interface MarketDepth_market_depth_lastTrade {
  __typename: "Trade";
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
}

export interface MarketDepth_market_depth_sell {
  __typename: "PriceLevel";
  /**
   * The price of all the orders at this level (uint64)
   */
  price: string;
  /**
   * The total remaining size of all orders at this level (uint64)
   */
  volume: string;
  /**
   * The number of orders at this price level (uint64)
   */
  numberOfOrders: string;
}

export interface MarketDepth_market_depth_buy {
  __typename: "PriceLevel";
  /**
   * The price of all the orders at this level (uint64)
   */
  price: string;
  /**
   * The total remaining size of all orders at this level (uint64)
   */
  volume: string;
  /**
   * The number of orders at this price level (uint64)
   */
  numberOfOrders: string;
}

export interface MarketDepth_market_depth {
  __typename: "MarketDepth";
  /**
   * Last trade for the given market (if available)
   */
  lastTrade: MarketDepth_market_depth_lastTrade | null;
  /**
   * Sell side price levels (if available)
   */
  sell: MarketDepth_market_depth_sell[] | null;
  /**
   * Buy side price levels (if available)
   */
  buy: MarketDepth_market_depth_buy[] | null;
  /**
   * Sequence number for the current snapshot of the market depth
   */
  sequenceNumber: string;
}

export interface MarketDepth_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the market. (uint64)
   * 
   * Examples:
   * Currency     Balance  decimalPlaces  Real Balance
   * GBP              100              0       GBP 100
   * GBP              100              2       GBP   1.00
   * GBP              100              4       GBP   0.01
   * GBP                1              4       GBP   0.0001   (  0.01p  )
   * 
   * GBX (pence)      100              0       GBP   1.00     (100p     )
   * GBX (pence)      100              2       GBP   0.01     (  1p     )
   * GBX (pence)      100              4       GBP   0.0001   (  0.01p  )
   * GBX (pence)        1              4       GBP   0.000001 (  0.0001p)
   */
  decimalPlaces: number;
  /**
   * positionDecimalPlaces indicates the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   * This sets how big the smallest order / position on the market can be.
   */
  positionDecimalPlaces: number;
  /**
   * marketData for the given market
   */
  data: MarketDepth_market_data | null;
  /**
   * Current depth on the order book for this market
   */
  depth: MarketDepth_market_depth;
}

export interface MarketDepth {
  /**
   * An instrument that is trading on the Vega network
   */
  market: MarketDepth_market | null;
}

export interface MarketDepthVariables {
  marketId: string;
}
