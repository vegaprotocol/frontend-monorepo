/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "./globalTypes";

// ====================================================
// GraphQL query operation: Markets
// ====================================================

export interface Markets_markets_data_market {
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

export interface Markets_markets_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: Markets_markets_data_market;
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

export interface Markets_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface Markets_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: Markets_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface Markets_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: Markets_markets_tradableInstrument_instrument_product;
}

export interface Markets_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: Markets_markets_tradableInstrument_instrument;
}

export interface Markets_markets {
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
  data: Markets_markets_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: Markets_markets_tradableInstrument;
}

export interface Markets {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: Markets_markets[] | null;
}
