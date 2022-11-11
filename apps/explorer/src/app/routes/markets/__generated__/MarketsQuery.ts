/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MarketTradingMode, MarketState, AccountType, AuctionTrigger } from "./../../../../../../../libs/types/src/__generated__/globalTypes";

// ====================================================
// GraphQL query operation: MarketsQuery
// ====================================================

export interface MarketsQuery_marketsConnection_edges_node_fees_factors {
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

export interface MarketsQuery_marketsConnection_edges_node_fees {
  __typename: "Fees";
  /**
   * The factors used to calculate the different fees
   */
  factors: MarketsQuery_marketsConnection_edges_node_fees_factors;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_metadata {
  __typename: "InstrumentMetadata";
  /**
   * An arbitrary list of tags to associated to associate to the Instrument (string list)
   */
  tags: string[] | null;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset_globalRewardPoolAccount {
  __typename: "AccountBalance";
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
  /**
   * The precision of the asset. Should match the decimal precision of the asset on its native chain, e.g: for ERC20 assets, it is often 18
   */
  decimals: number;
  /**
   * The global reward pool account for this asset
   */
  globalRewardPoolAccount: MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset_globalRewardPoolAccount | null;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product {
  __typename: "Future";
  /**
   * The name of the asset (string)
   */
  settlementAsset: MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product_settlementAsset;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument {
  __typename: "Instrument";
  /**
   * Full and fairly descriptive name for the instrument
   */
  name: string;
  /**
   * Metadata for this instrument
   */
  metadata: MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_metadata;
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
  product: MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument_product;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_LogNormalRiskModel_params {
  __typename: "LogNormalModelParams";
  /**
   * R parameter
   */
  r: number;
  /**
   * Sigma parameter, annualised volatility of the underlying asset, must be a strictly non-negative real number
   */
  sigma: number;
  /**
   * Mu parameter, annualised growth rate of the underlying asset
   */
  mu: number;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_LogNormalRiskModel {
  __typename: "LogNormalRiskModel";
  /**
   * Tau parameter of the risk model, projection horizon measured as a year fraction used in the expected shortfall calculation to obtain the maintenance margin, must be a strictly non-negative real number
   */
  tau: number;
  /**
   * Lambda parameter of the risk model, probability confidence level used in expected shortfall calculation when obtaining the maintenance margin level, must be strictly greater than 0 and strictly smaller than 1
   */
  riskAversionParameter: number;
  /**
   * Parameters for the log normal risk model
   */
  params: MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_LogNormalRiskModel_params;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_SimpleRiskModel_params {
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

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_SimpleRiskModel {
  __typename: "SimpleRiskModel";
  /**
   * Params for the simple risk model
   */
  params: MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_SimpleRiskModel_params;
}

export type MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel = MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_LogNormalRiskModel | MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel_SimpleRiskModel;

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_marginCalculator_scalingFactors {
  __typename: "ScalingFactors";
  /**
   * The scaling factor that determines the margin level at which Vega has to search for more money
   */
  searchLevel: number;
  /**
   * The scaling factor that determines the optimal margin level
   */
  initialMargin: number;
  /**
   * The scaling factor that determines the overflow margin level
   */
  collateralRelease: number;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument_marginCalculator {
  __typename: "MarginCalculator";
  /**
   * The scaling factors that will be used for margin calculation
   */
  scalingFactors: MarketsQuery_marketsConnection_edges_node_tradableInstrument_marginCalculator_scalingFactors;
}

export interface MarketsQuery_marketsConnection_edges_node_tradableInstrument {
  __typename: "TradableInstrument";
  /**
   * An instance of, or reference to, a fully specified instrument.
   */
  instrument: MarketsQuery_marketsConnection_edges_node_tradableInstrument_instrument;
  /**
   * A reference to a risk model that is valid for the instrument
   */
  riskModel: MarketsQuery_marketsConnection_edges_node_tradableInstrument_riskModel;
  /**
   * Margin calculation info, currently only the scaling factors (search, initial, release) for this tradable instrument
   */
  marginCalculator: MarketsQuery_marketsConnection_edges_node_tradableInstrument_marginCalculator | null;
}

export interface MarketsQuery_marketsConnection_edges_node_openingAuction {
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

export interface MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings_parameters_triggers {
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
   * breach its theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
}

export interface MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings_parameters {
  __typename: "PriceMonitoringParameters";
  /**
   * The list of triggers for this price monitoring
   */
  triggers: MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings_parameters_triggers[] | null;
}

export interface MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings {
  __typename: "PriceMonitoringSettings";
  /**
   * Specified a set of PriceMonitoringParameters to be use for price monitoring purposes
   */
  parameters: MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings_parameters | null;
}

export interface MarketsQuery_marketsConnection_edges_node_liquidityMonitoringParameters_targetStakeParameters {
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

export interface MarketsQuery_marketsConnection_edges_node_liquidityMonitoringParameters {
  __typename: "LiquidityMonitoringParameters";
  /**
   * Specifies the triggering ratio for entering liquidity auction
   */
  triggeringRatio: number;
  /**
   * Specifies parameters related to target stake calculation
   */
  targetStakeParameters: MarketsQuery_marketsConnection_edges_node_liquidityMonitoringParameters_targetStakeParameters;
}

export interface MarketsQuery_marketsConnection_edges_node_proposal {
  __typename: "Proposal";
  /**
   * Proposal ID that is filled by Vega once proposal reaches the network
   */
  id: string | null;
}

export interface MarketsQuery_marketsConnection_edges_node_accountsConnection_edges_node_asset {
  __typename: "Asset";
  /**
   * The ID of the asset
   */
  id: string;
  /**
   * The full name of the asset (e.g: Great British Pound)
   */
  name: string;
}

export interface MarketsQuery_marketsConnection_edges_node_accountsConnection_edges_node {
  __typename: "AccountBalance";
  /**
   * Asset, the 'currency'
   */
  asset: MarketsQuery_marketsConnection_edges_node_accountsConnection_edges_node_asset;
  /**
   * Balance as string - current account balance (approx. as balances can be updated several times per second)
   */
  balance: string;
  /**
   * Account type (General, Margin, etc)
   */
  type: AccountType;
}

export interface MarketsQuery_marketsConnection_edges_node_accountsConnection_edges {
  __typename: "AccountEdge";
  /**
   * The account
   */
  node: MarketsQuery_marketsConnection_edges_node_accountsConnection_edges_node;
}

export interface MarketsQuery_marketsConnection_edges_node_accountsConnection {
  __typename: "AccountsConnection";
  /**
   * List of accounts available for the connection
   */
  edges: (MarketsQuery_marketsConnection_edges_node_accountsConnection_edges | null)[] | null;
}

export interface MarketsQuery_marketsConnection_edges_node_data_priceMonitoringBounds_trigger {
  __typename: "PriceMonitoringTrigger";
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach its theoretical level over the specified horizon at the specified
   * probability level (> 0)
   */
  auctionExtensionSecs: number;
  /**
   * Price monitoring probability level p. (>0 and < 1)
   */
  probability: number;
}

export interface MarketsQuery_marketsConnection_edges_node_data_priceMonitoringBounds {
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
  trigger: MarketsQuery_marketsConnection_edges_node_data_priceMonitoringBounds_trigger;
  /**
   * Reference price used to calculate the valid price range
   */
  referencePrice: string;
}

export interface MarketsQuery_marketsConnection_edges_node_data_liquidityProviderFeeShare_party {
  __typename: "Party";
  /**
   * Party identifier
   */
  id: string;
}

export interface MarketsQuery_marketsConnection_edges_node_data_liquidityProviderFeeShare {
  __typename: "LiquidityProviderFeeShare";
  /**
   * The liquidity provider party ID
   */
  party: MarketsQuery_marketsConnection_edges_node_data_liquidityProviderFeeShare_party;
  /**
   * The share owned by this liquidity provider (float)
   */
  equityLikeShare: string;
  /**
   * The average entry valuation of the liquidity provider for the market
   */
  averageEntryValuation: string;
}

export interface MarketsQuery_marketsConnection_edges_node_data {
  __typename: "MarketData";
  /**
   * The mark price (an unsigned integer)
   */
  markPrice: string;
  /**
   * The highest price level on an order book for buy orders.
   */
  bestBidPrice: string;
  /**
   * The aggregated volume being bid at the best bid price.
   */
  bestBidVolume: string;
  /**
   * The lowest price level on an order book for offer orders.
   */
  bestOfferPrice: string;
  /**
   * The aggregated volume being offered at the best offer price.
   */
  bestOfferVolume: string;
  /**
   * The highest price level on an order book for buy orders not including pegged orders.
   */
  bestStaticBidPrice: string;
  /**
   * The aggregated volume being offered at the best static bid price, excluding pegged orders
   */
  bestStaticBidVolume: string;
  /**
   * The lowest price level on an order book for offer orders not including pegged orders.
   */
  bestStaticOfferPrice: string;
  /**
   * The aggregated volume being offered at the best static offer price, excluding pegged orders.
   */
  bestStaticOfferVolume: string;
  /**
   * The arithmetic average of the best bid price and best offer price.
   */
  midPrice: string;
  /**
   * The arithmetic average of the best static bid price and best static offer price
   */
  staticMidPrice: string;
  /**
   * RFC3339Nano time at which this market price was relevant
   */
  timestamp: string;
  /**
   * The sum of the size of all positions greater than 0.
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
   * Indicative price if the auction ended now, 0 if not in auction mode
   */
  indicativePrice: string;
  /**
   * Indicative volume if the auction ended now, 0 if not in auction mode
   */
  indicativeVolume: string;
  /**
   * What triggered an auction (if an auction was started)
   */
  trigger: AuctionTrigger;
  /**
   * What extended the ongoing auction (if an auction was extended)
   */
  extensionTrigger: AuctionTrigger;
  /**
   * The amount of stake targeted for this market
   */
  targetStake: string | null;
  /**
   * The supplied stake for the market
   */
  suppliedStake: string | null;
  /**
   * A list of valid price ranges per associated trigger
   */
  priceMonitoringBounds: MarketsQuery_marketsConnection_edges_node_data_priceMonitoringBounds[] | null;
  /**
   * The market value proxy
   */
  marketValueProxy: string;
  /**
   * The equity like share of liquidity fee for each liquidity provider
   */
  liquidityProviderFeeShare: MarketsQuery_marketsConnection_edges_node_data_liquidityProviderFeeShare[] | null;
}

export interface MarketsQuery_marketsConnection_edges_node {
  __typename: "Market";
  /**
   * Market ID
   */
  id: string;
  /**
   * Fees related data
   */
  fees: MarketsQuery_marketsConnection_edges_node_fees;
  /**
   * An instance of, or reference to, a tradable instrument.
   */
  tradableInstrument: MarketsQuery_marketsConnection_edges_node_tradableInstrument;
  /**
   * The number of decimal places that an integer must be shifted by in order to get a correct
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
   * Auction duration specifies how long the opening auction will run (minimum
   * duration and optionally a minimum traded volume).
   */
  openingAuction: MarketsQuery_marketsConnection_edges_node_openingAuction;
  /**
   * Price monitoring settings for the market
   */
  priceMonitoringSettings: MarketsQuery_marketsConnection_edges_node_priceMonitoringSettings;
  /**
   * Liquidity monitoring parameters for the market
   */
  liquidityMonitoringParameters: MarketsQuery_marketsConnection_edges_node_liquidityMonitoringParameters;
  /**
   * Current mode of execution of the market
   */
  tradingMode: MarketTradingMode;
  /**
   * Current state of the market
   */
  state: MarketState;
  /**
   * The proposal that initiated this market
   */
  proposal: MarketsQuery_marketsConnection_edges_node_proposal | null;
  /**
   * Get account for a party or market
   */
  accountsConnection: MarketsQuery_marketsConnection_edges_node_accountsConnection | null;
  /**
   * marketData for the given market
   */
  data: MarketsQuery_marketsConnection_edges_node_data | null;
}

export interface MarketsQuery_marketsConnection_edges {
  __typename: "MarketEdge";
  /**
   * The market
   */
  node: MarketsQuery_marketsConnection_edges_node;
}

export interface MarketsQuery_marketsConnection {
  __typename: "MarketConnection";
  /**
   * The markets in this connection
   */
  edges: MarketsQuery_marketsConnection_edges[];
}

export interface MarketsQuery {
  /**
   * One or more instruments that are trading on the Vega network
   */
  marketsConnection: MarketsQuery_marketsConnection | null;
}
