/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketState, MarketTradingMode } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: DealTicketQuery
// ====================================================

export interface DealTicketQuery_market_fees_factors {
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

export interface DealTicketQuery_market_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: DealTicketQuery_market_fees_factors;
}

export interface DealTicketQuery_market_priceMonitoringSettings_parameters_triggers {
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

export interface DealTicketQuery_market_priceMonitoringSettings_parameters {
  __typename: "PriceMonitoringParameters";
  /**
   * The list of triggers for this price monitoring
   */
  triggers: DealTicketQuery_market_priceMonitoringSettings_parameters_triggers[] | null;
}

export interface DealTicketQuery_market_priceMonitoringSettings {
  __typename: "PriceMonitoringSettings";
  /**
   * Specified a set of PriceMonitoringParameters to be use for price monitoring purposes
   */
  parameters: DealTicketQuery_market_priceMonitoringSettings_parameters | null;
  /**
   * How often (in seconds) the price monitoring bounds should be updated
   */
  updateFrequencySecs: number;
}

export interface DealTicketQuery_market_riskFactors {
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

export interface DealTicketQuery_market_data_market {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
}

export interface DealTicketQuery_market_data {
  __typename: "MarketData";
  /**
   * market id of the associated mark price
   */
  market: DealTicketQuery_market_data_market;
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
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
}

export interface DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset {
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

export interface DealTicketQuery_market_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * String representing the quote (e.g. BTCUSD -> USD is quote)
   */
  quoteName: string;
  /**
   * The name of the asset (string)
   */
  settlementAsset: DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset;
}

export interface DealTicketQuery_market_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: DealTicketQuery_market_tradableInstrument_instrument_product;
}

export interface DealTicketQuery_market_tradableInstrument_riskModel_LogNormalRiskModel_params {
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

export interface DealTicketQuery_market_tradableInstrument_riskModel_LogNormalRiskModel {
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
  params: DealTicketQuery_market_tradableInstrument_riskModel_LogNormalRiskModel_params;
}

export interface DealTicketQuery_market_tradableInstrument_riskModel_SimpleRiskModel_params {
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

export interface DealTicketQuery_market_tradableInstrument_riskModel_SimpleRiskModel {
  __typename: "SimpleRiskModel";
  /**
   * Params for the simple risk model
   */
  params: DealTicketQuery_market_tradableInstrument_riskModel_SimpleRiskModel_params;
}

export type DealTicketQuery_market_tradableInstrument_riskModel = DealTicketQuery_market_tradableInstrument_riskModel_LogNormalRiskModel | DealTicketQuery_market_tradableInstrument_riskModel_SimpleRiskModel;

export interface DealTicketQuery_market_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: DealTicketQuery_market_tradableInstrument_instrument;
  /**
   * A reference to a risk model that is valid for the instrument
   */
  riskModel: DealTicketQuery_market_tradableInstrument_riskModel;
}

export interface DealTicketQuery_market_depth_lastTrade {
  __typename: "Trade";
  /**
   * The price of the trade (probably initially the passive order price, other determination algorithms are possible though) (uint64)
   */
  price: string;
}

export interface DealTicketQuery_market_depth {
  __typename: "MarketDepth";
  /**
   * Last trade for the given market (if available)
   */
  lastTrade: DealTicketQuery_market_depth_lastTrade | null;
}

export interface DealTicketQuery_market {
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
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Fees related data
   */
  fees: DealTicketQuery_market_fees;
  /**
   * Price monitoring settings for the market
   */
  priceMonitoringSettings: DealTicketQuery_market_priceMonitoringSettings;
  /**
   * risk factors for the market
   */
  riskFactors: DealTicketQuery_market_riskFactors | null;
  /**
   * marketData for the given market
   */
  data: DealTicketQuery_market_data | null;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: DealTicketQuery_market_tradableInstrument;
  /**
   * Current depth on the order book for this market
   */
  depth: DealTicketQuery_market_depth;
}

export interface DealTicketQuery {
  /**
   * An instrument that is trading on the VEGA network
   */
  market: DealTicketQuery_market | null;
}

export interface DealTicketQueryVariables {
  marketId: string;
}
