/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MarketFilters
// ====================================================

export interface MarketFilters_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
}

export interface MarketFilters_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketFilters_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface MarketFilters_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketFilters_markets_tradableInstrument_instrument_product;
}

export interface MarketFilters_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketFilters_markets_tradableInstrument_instrument;
}

export interface MarketFilters_markets {
  __typename: "Market";
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketFilters_markets_tradableInstrument;
}

export interface MarketFilters {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketFilters_markets[] | null;
}
