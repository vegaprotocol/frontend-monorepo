/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: SimpleMarkets
// ====================================================

export interface SimpleMarkets_markets_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
}

export interface SimpleMarkets_markets_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: SimpleMarkets_markets_data_market;
  /**
   * RFC3339Nano time at which the auction will stop (null if not in auction mode)
   */
  auctionEnd: string | null;
  /**
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: SimpleMarkets_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface SimpleMarkets_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: SimpleMarkets_markets_tradableInstrument_instrument_product;
}

export interface SimpleMarkets_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: SimpleMarkets_markets_tradableInstrument_instrument;
}

export interface SimpleMarkets_markets_candles {
  __typename: "Candle";
  /**
   * Open price (uint64)
   */
  open: string;
  /**
   * Close price (uint64)
   */
  close: string;
}

export interface SimpleMarkets_markets {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Market full name
   */
  name: string;
  /**
   * decimalPlaces indicates the number of decimal places that an integer must be shifted by in order to get a correct
   * number denominated in the currency of the Market. (uint64)
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
   * marketData for the given market
   */
  data: SimpleMarkets_markets_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: SimpleMarkets_markets_tradableInstrument;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by params
   */
  candles: (SimpleMarkets_markets_candles | null)[] | null;
}

export interface SimpleMarkets {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: SimpleMarkets_markets[] | null;
}

export interface SimpleMarketsVariables {
  CandleInterval: Interval;
  CandleSince: string;
}
