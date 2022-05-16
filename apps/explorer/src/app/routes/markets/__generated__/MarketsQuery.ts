/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode, MarketState, AccountType, AuctionTrigger } from "@vegaprotocol/types";

// ====================================================
// GraphQL query operation: MarketsQuery
// ====================================================

export interface MarketsQuery_markets_fees_factors {
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

export interface MarketsQuery_markets_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: MarketsQuery_markets_fees_factors;
}

export interface MarketsQuery_markets_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketsQuery_markets_tradableInstrument_instrument_product_settlementAsset_globalRewardPoolAccount {
  __typename: "Account";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface MarketsQuery_markets_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The precision of the asset
   */
  decimals: number;
  /**
   * The total supply of the market
   */
  totalSupply: string;
  /**
   * The global reward pool account for this asset
   */
  globalRewardPoolAccount: MarketsQuery_markets_tradableInstrument_instrument_product_settlementAsset_globalRewardPoolAccount | null;
}

export interface MarketsQuery_markets_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketsQuery_markets_tradableInstrument_instrument_product_settlementAsset;
}

export interface MarketsQuery_markets_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * Metadata for this instrument
   */
  metadata: MarketsQuery_markets_tradableInstrument_instrument_metadata;
  /**
   * Uniquely identify an instrument across all instruments available on Vega (string)
   */
  id: string;
  /**
   * A short non necessarily unique code used to easily describe the instrument (e.g: FX:BTCUSD/DEC18) (string)
   */
  code: string;
  /**
   * A reference to or instance of a fully specified product, including all required product parameters for that product (Product union)
   */
  product: MarketsQuery_markets_tradableInstrument_instrument_product;
}

export interface MarketsQuery_markets_tradableInstrument_riskModel_LogNormalRiskModel_params {
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

export interface MarketsQuery_markets_tradableInstrument_riskModel_LogNormalRiskModel {
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
  params: MarketsQuery_markets_tradableInstrument_riskModel_LogNormalRiskModel_params;
}

export interface MarketsQuery_markets_tradableInstrument_riskModel_SimpleRiskModel_params {
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

export interface MarketsQuery_markets_tradableInstrument_riskModel_SimpleRiskModel {
  __typename: "SimpleRiskModel";
  /**
   * Params for the simple risk model
   */
  params: MarketsQuery_markets_tradableInstrument_riskModel_SimpleRiskModel_params;
}

export type MarketsQuery_markets_tradableInstrument_riskModel = MarketsQuery_markets_tradableInstrument_riskModel_LogNormalRiskModel | MarketsQuery_markets_tradableInstrument_riskModel_SimpleRiskModel;

export interface MarketsQuery_markets_tradableInstrument_marginCalculator_scalingFactors {
  __typename: "ScalingFactors";
  /**
   * the scaling factor that determines the margin level at which Vega has to search for more money
   */
  searchLevel: number;
  /**
   * the scaling factor that determines the optimal margin level
   */
  initialMargin: number;
  /**
   * The scaling factor that determines the overflow margin level
   */
  collateralRelease: number;
}

export interface MarketsQuery_markets_tradableInstrument_marginCalculator {
  __typename: "MarginCalculator";
  /**
   * The scaling factors that will be used for margin calculation
   */
  scalingFactors: MarketsQuery_markets_tradableInstrument_marginCalculator_scalingFactors;
}

export interface MarketsQuery_markets_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of or reference to a fully specified instrument.
   */
  instrument: MarketsQuery_markets_tradableInstrument_instrument;
  /**
   * A reference to a risk model that is valid for the instrument
   */
  riskModel: MarketsQuery_markets_tradableInstrument_riskModel;
  /**
   * Margin calculation info, currently only the scaling factors (search, initial, release) for this tradable instrument
   */
  marginCalculator: MarketsQuery_markets_tradableInstrument_marginCalculator | null;
}

export interface MarketsQuery_markets_openingAuction {
  __typename: "AuctionDuration";
  /**
   * Duration of the auction in seconds
   */
  durationSecs: number;
  /**
   * Target uncrossing trading volume
   */
  volume: number;
}

export interface MarketsQuery_markets_priceMonitoringSettings_parameters_triggers {
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

export interface MarketsQuery_markets_priceMonitoringSettings_parameters {
  __typename: "PriceMonitoringParameters";
  /**
   * The list of triggers for this price monitoring
   */
  triggers: MarketsQuery_markets_priceMonitoringSettings_parameters_triggers[] | null;
}

export interface MarketsQuery_markets_priceMonitoringSettings {
  __typename: "PriceMonitoringSettings";
  /**
   * Specified a set of PriceMonitoringParameters to be use for price monitoring purposes
   */
  parameters: MarketsQuery_markets_priceMonitoringSettings_parameters | null;
  /**
   * How often (in seconds) the price monitoring bounds should be updated
   */
  updateFrequencySecs: number;
}

export interface MarketsQuery_markets_liquidityMonitoringParameters_targetStakeParameters {
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

export interface MarketsQuery_markets_liquidityMonitoringParameters {
  __typename: "LiquidityMonitoringParameters";
  /**
   * Specifies the triggering ratio for entering liquidity auction
   */
  triggeringRatio: number;
  /**
   * Specifies parameters related to target stake calculation
   */
  targetStakeParameters: MarketsQuery_markets_liquidityMonitoringParameters_targetStakeParameters;
}

export interface MarketsQuery_markets_proposal {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by VEGA once proposal reaches the network
   */
  id: string | null;
}

export interface MarketsQuery_markets_accounts_asset {
  __typename: "Asset";
  /**
   * The id of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
}

export interface MarketsQuery_markets_accounts {
  __typename: "Account";
  /**
   * Asset, the 'currency'
   */
  asset: MarketsQuery_markets_accounts_asset;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
}

export interface MarketsQuery_markets_data_priceMonitoringBounds_trigger {
  __typename: "PriceMonitoringTrigger";
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach it's theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
  /**
   * Price monitoring probability level p. (>0 and < 1)
   */
  probability: number;
}

export interface MarketsQuery_markets_data_priceMonitoringBounds {
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
  trigger: MarketsQuery_markets_data_priceMonitoringBounds_trigger;
  /**
   * Reference price used to calculate the valid price range
   */
  referencePrice: string;
}

export interface MarketsQuery_markets_data_liquidityProviderFeeShare_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface MarketsQuery_markets_data_liquidityProviderFeeShare {
  __typename: "LiquidityProviderFeeShare";
  /**
   * The liquidity provider party id
   */
  party: MarketsQuery_markets_data_liquidityProviderFeeShare_party;
  /**
   * The share own by this liquidity provider (float)
   */
  equityLikeShare: string;
  /**
   * the average entry valuation of the liquidity provider for the market
   */
  averageEntryValuation: string;
}

export interface MarketsQuery_markets_data {
  __typename: "MarketData";
  /**
   * the mark price (actually an unsigned int)
   */
  markPrice: string;
  /**
   * the highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * the aggregated volume being bid at the best bid price.
   */
  bestBidVolume: string;
  /**
   * the lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * the aggregated volume being offered at the best offer price.
   */
  bestOfferVolume: string;
  /**
   * the highest price level on an order book for buy orders not including pegged orders.
   */
  bestStaticBidPrice: string;
  /**
   * the aggregated volume being offered at the best static bid price, excluding pegged orders
   */
  bestStaticBidVolume: string;
  /**
   * the lowest price level on an order book for offer orders not including pegged orders.
   */
  bestStaticOfferPrice: string;
  /**
   * the aggregated volume being offered at the best static offer price, excluding pegged orders.
   */
  bestStaticOfferVolume: string;
  /**
   * the arithmetic average of the best bid price and best offer price.
   */
  midPrice: string;
  /**
   * the arithmetic average of the best static bid price and best static offer price
   */
  staticMidPrice: string;
  /**
   * RFC3339Nano time at which this market price was relevant
   */
  timestamp: string;
  /**
   * the sum of the size of all positions greater than 0.
   */
  openInterest: string;
  /**
   * RFC3339Nano time at which the auction will stop (null if not in auction mode)
   */
  auctionEnd: string | null;
  /**
   * RFC3339Nano time at which the next auction will start (null if none is scheduled)
   */
  auctionStart: string | null;
  /**
   * indicative price if the auction ended now, 0 if not in auction mode
   */
  indicativePrice: string;
  /**
   * indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * what triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * what extended the ongoing auction (if an auction was extended)
   */
  extensionTrigger: AuctionTrigger;
  /**
   * the amount of stake targeted for this market
   */
  targetStake: string | null;
  /**
   * the supplied stake for the market
   */
  suppliedStake: string | null;
  /**
   * A list of valid price ranges per associated trigger
   */
  priceMonitoringBounds: MarketsQuery_markets_data_priceMonitoringBounds[] | null;
  /**
   * the market value proxy
   */
  marketValueProxy: string;
  /**
   * the equity like share of liquidity fee for each liquidity provider
   */
  liquidityProviderFeeShare: MarketsQuery_markets_data_liquidityProviderFeeShare[] | null;
}

export interface MarketsQuery_markets {
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
   * Fees related data
   */
  fees: MarketsQuery_markets_fees;
  /**
   * An instance of or reference to a tradable instrument.
   */
  tradableInstrument: MarketsQuery_markets_tradableInstrument;
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
   * Auction duration specifies how long the opening auction will run (minimum
   * duration and optionally a minimum traded volume).
   */
  openingAuction: MarketsQuery_markets_openingAuction;
  /**
   * Price monitoring settings for the market
   */
  priceMonitoringSettings: MarketsQuery_markets_priceMonitoringSettings;
  /**
   * Liquidity monitoring parameters for the market
   */
  liquidityMonitoringParameters: MarketsQuery_markets_liquidityMonitoringParameters;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * The proposal which initiated this market
   */
  proposal: MarketsQuery_markets_proposal | null;
  /**
   * Get account for a party or market
   */
  accounts: MarketsQuery_markets_accounts[] | null;
  /**
   * marketData for the given market
   */
  data: MarketsQuery_markets_data | null;
}

export interface MarketsQuery {
  /**
   * One or more instruments that are trading on the VEGA network
   */
  markets: MarketsQuery_markets[] | null;
}
