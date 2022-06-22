/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: FillsSub
// ====================================================

export interface FillsSub_trades_buyer {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface FillsSub_trades_seller {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface FillsSub_trades_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
}

export interface FillsSub_trades_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: FillsSub_trades_market_tradableInstrument_instrument;
}

export interface FillsSub_trades_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
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
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: FillsSub_trades_market_tradableInstrument;
}

export interface FillsSub_trades {
  __typename: "Trade";
  /**
   * The hash of the trade data
   */
  id: string;
  /**
   * RFC3339Nano time for when the trade occurred
   */
  createdAt: string;
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
  /**
   * The number of contracts trades, will always be <= the remaining size of both orders immediately before the trade (uint64)
   */
  size: string;
  /**
   * The order that bought
   */
  buyOrder: string;
  /**
   * The order that sold
   */
  sellOrder: string;
  /**
   * The party that bought
   */
  buyer: FillsSub_trades_buyer;
  /**
   * The party that sold
   */
  seller: FillsSub_trades_seller;
  /**
   * The market the trade occurred on
   */
  market: FillsSub_trades_market;
}

export interface FillsSub {
  /**
   * Subscribe to the trades updates
   */
  trades: FillsSub_trades[] | null;
}

export interface FillsSubVariables {
  partyId: string;
}
