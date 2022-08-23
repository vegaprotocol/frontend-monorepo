/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Interval, MarketState, AccountType, MarketTradingMode, AuctionTrigger } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketInfoQuery
// ====================================================

export interface MarketInfoQuery_market_accounts_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
}

export interface MarketInfoQuery_market_accounts {
  __typename: "Account";
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
  /**
   * Asset, the 'currency'
   */
  asset: MarketInfoQuery_market_accounts_asset;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface MarketInfoQuery_market_fees_factors {
  __typename: "FeeFactors";
  /**
   * The factor applied to calculate MakerFees, a non-negative float
   */
  makerFee: string;
  /**
   * The factor applied to calculate InfrastructureFees, a non-negative float
   */
  infrastructureFee: string;
  /**
   * The factor applied to calculate LiquidityFees, a non-negative float
   */
  liquidityFee: string;
}

export interface MarketInfoQuery_market_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: MarketInfoQuery_market_fees_factors;
}

export interface MarketInfoQuery_market_priceMonitoringSettings_parameters_triggers {
  __typename: "PriceMonitoringTrigger";
  /**
   * Price monitoring projection horizon τ in seconds (> 0).
   */
  horizonSecs: number;
  /**
   * Price monitoring probability level p. (>0 and < 1)
   */
  probability: number;
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach it's theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
}

export interface MarketInfoQuery_market_priceMonitoringSettings_parameters {
  __typename: "PriceMonitoringParameters";
  /**
   * The list of triggers for this price monitoring
   */
  triggers: MarketInfoQuery_market_priceMonitoringSettings_parameters_triggers[] | null;
}

export interface MarketInfoQuery_market_priceMonitoringSettings {
  __typename: "PriceMonitoringSettings";
  /**
   * Specified a set of PriceMonitoringParameters to be use for price monitoring purposes
   */
  parameters: MarketInfoQuery_market_priceMonitoringSettings_parameters | null;
}

export interface MarketInfoQuery_market_riskFactors {
  __typename: "RiskFactor";
  /**
   * market the risk factor was emitted for
   */
  market: string;
  /**
   * short factor
   */
  short: string;
  /**
   * long factor
   */
  long: string;
}

export interface MarketInfoQuery_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface MarketInfoQuery_market_data_priceMonitoringBounds_trigger {
  __typename: "PriceMonitoringTrigger";
  /**
   * Price monitoring projection horizon τ in seconds (> 0).
   */
  horizonSecs: number;
  /**
   * Price monitoring probability level p. (>0 and < 1)
   */
  probability: number;
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach it's theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
}

export interface MarketInfoQuery_market_data_priceMonitoringBounds {
  __typename: "PriceMonitoringBounds";
  /**
   * Minimum price that isn't currently breaching the specified price monitoring trigger
   */
  minValidPrice: string;
  /**
   * Maximum price that isn't currently breaching the specified price monitoring trigger
   */
  maxValidPrice: string;
  /**
   * Price monitoring trigger associated with the bounds
   */
  trigger: MarketInfoQuery_market_data_priceMonitoringBounds_trigger;
  /**
   * Reference price used to calculate the valid price range
   */
  referencePrice: string;
}

export interface MarketInfoQuery_market_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: MarketInfoQuery_market_data_market;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * the aggregated volume being bid at the best bid price.
   */
  bestBidVolume: string;
  /**
   * the aggregated volume being offered at the best offer price.
   */
  bestOfferVolume: string;
  /**
   * the aggregated volume being offered at the best static bid price, excluding pegged orders
   */
  bestStaticBidVolume: string;
  /**
   * the aggregated volume being offered at the best static offer price, excluding pegged orders.
   */
  bestStaticOfferVolume: string;
  /**
   * the sum of the size of all positions greater than 0.
   */
  openInterest: string;
  /*
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * A list of valid price ranges per associated trigger
   */
  priceMonitoringBounds: MarketInfoQuery_market_data_priceMonitoringBounds[] | null;
}

export interface MarketInfoQuery_market_liquidityMonitoringParameters_targetStakeParameters {
  __typename: "TargetStakeParameters";
  /**
   * Specifies length of time window expressed in seconds for target stake calculation
   */
  timeWindow: number;
  /**
   * Specifies scaling factors used in target stake calculation
   */
  scalingFactor: number;
}

export interface MarketInfoQuery_market_liquidityMonitoringParameters {
  __typename: "LiquidityMonitoringParameters";
  /**
   * Specifies the triggering ratio for entering liquidity auction
   */
  triggeringRatio: number;
  /**
   * Specifies parameters related to target stake calculation
   */
  targetStakeParameters: MarketInfoQuery_market_liquidityMonitoringParameters_targetStakeParameters;
}

export interface MarketInfoQuery_market_candles {
  __typename: "Candle";
  /**
   * Volume price (uint64)
   */
  volume: string;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The symbol of the asset (e.g: GBP)
   */
  symbol: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecForSettlementPrice {
  __typename: "OracleSpec";
  /**
   * id is a hash generated from the OracleSpec data.
   */
  id: string;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecForTradingTermination {
  __typename: "OracleSpec";
  /**
   * id is a hash generated from the OracleSpec data.
   */
  id: string;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecBinding {
  __typename: "OracleSpecToFutureBinding";
  settlementPriceProperty: string;
  tradingTerminationProperty: string;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketInfoQuery_market_tradableInstrument_instrument_product_settlementAsset;
  /**
   * The oracle spec describing the oracle data of interest for settlement price.
   */
  oracleSpecForSettlementPrice: MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecForSettlementPrice;
  /**
   * The oracle spec describing the oracle data of interest for trading termination.
   */
  oracleSpecForTradingTermination: MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecForTradingTermination;
  /**
   * The binding between the oracle spec and the settlement price
   */
  oracleSpecBinding: MarketInfoQuery_market_tradableInstrument_instrument_product_oracleSpecBinding;
}

export interface MarketInfoQuery_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * Metadata for this instrument
   */
  metadata: MarketInfoQuery_market_tradableInstrument_instrument_metadata;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketInfoQuery_market_tradableInstrument_instrument_product;
}

export interface MarketInfoQuery_market_tradableInstrument_riskModel_LogNormalRiskModel_params {
  __typename: "LogNormalModelParams";
  /**
   * r parameter
   */
  r: number;
  /**
   * sigma parameter
   */
  sigma: number;
  /**
   * mu parameter
   */
  mu: number;
}

export interface MarketInfoQuery_market_tradableInstrument_riskModel_LogNormalRiskModel {
  __typename: "LogNormalRiskModel";
  /**
   * Tau parameter of the risk model
   */
  tau: number;
  /**
   * Lambda parameter of the risk model
   */
  riskAversionParameter: number;
  /**
   * Params for the log normal risk model
   */
  params: MarketInfoQuery_market_tradableInstrument_riskModel_LogNormalRiskModel_params;
}

export interface MarketInfoQuery_market_tradableInstrument_riskModel_SimpleRiskModel_params {
  __typename: "SimpleRiskModelParams";
  /**
   * Risk factor for long
   */
  factorLong: number;
  /**
   * Risk factor for short
   */
  factorShort: number;
}

export interface MarketInfoQuery_market_tradableInstrument_riskModel_SimpleRiskModel {
  __typename: "SimpleRiskModel";
  /**
   * Params for the simple risk model
   */
  params: MarketInfoQuery_market_tradableInstrument_riskModel_SimpleRiskModel_params;
}

export type MarketInfoQuery_market_tradableInstrument_riskModel = MarketInfoQuery_market_tradableInstrument_riskModel_LogNormalRiskModel | MarketInfoQuery_market_tradableInstrument_riskModel_SimpleRiskModel;

export interface MarketInfoQuery_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketInfoQuery_market_tradableInstrument_instrument;
  /**
   * A reference to a risk model that is valid for the instrument
   */
  riskModel: MarketInfoQuery_market_tradableInstrument_riskModel;
}

export interface MarketInfoQuery_market_depth_lastTrade {
  __typename: "Trade";
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
}

export interface MarketInfoQuery_market_depth {
  __typename: "MarketDepth";
  /**
   * Last trade for the given market (if available)
   */
  lastTrade: MarketInfoQuery_market_depth_lastTrade | null;
}

export interface MarketInfoQuery_market {
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
   * positionDecimalPlaces indicated the number of decimal places that an integer must be shifted in order to get a correct size (uint64).
   * i.e. 0 means there are no fractional orders for the market, and order sizes are always whole sizes.
   * 2 means sizes given as 10^2 * desired size, e.g. a desired size of 1.23 is represented as 123 in this market.
   */
  positionDecimalPlaces: number;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * Get account for a party or market
   */
  accounts: MarketInfoQuery_market_accounts[] | null;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Fees related data
   */
  fees: MarketInfoQuery_market_fees;
  /**
   * Price monitoring settings for the market
   */
  priceMonitoringSettings: MarketInfoQuery_market_priceMonitoringSettings;
  /**
   * risk factors for the market
   */
  riskFactors: MarketInfoQuery_market_riskFactors | null;
  /**
   * marketData for the given market
   */
  data: MarketInfoQuery_market_data | null;
  /**
   * Liquidity monitoring parameters for the market
   */
  liquidityMonitoringParameters: MarketInfoQuery_market_liquidityMonitoringParameters;
  /**
   * Candles on a market, for the 'last' n candles, at 'interval' seconds as specified by params
   */
  candles: (MarketInfoQuery_market_candles | null)[] | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketInfoQuery_market_tradableInstrument;
  /**
   * Current depth on the order book for this market
   */
  depth: MarketInfoQuery_market_depth;
}

export interface MarketInfoQuery {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: MarketInfoQuery_market | null;
}

export interface MarketInfoQueryVariables {
  marketId: string;
  interval: Interval;
  since: string;
}
