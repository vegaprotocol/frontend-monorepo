/* eslint-disable */
import type { DataSourceSpec } from "./data_source";

export const protobufPackage = "vega";

/**
 * Auction duration is used to configure 3 auction periods:
 * 1. `duration > 0`, `volume == 0`:
 *   The auction will last for at least N seconds
 * 2. `duration == 0`, `volume > 0`:
 *   The auction will end once the given volume will match at uncrossing
 * 3. `duration > 0`, `volume > 0`:
 *   The auction will take at least N seconds, but can end sooner if the market can trade a certain volume
 */
export interface AuctionDuration {
  /** Duration of the auction in seconds. */
  duration: number;
  /** Target uncrossing trading volume. */
  volume: number;
}

/** Spot product definition */
export interface Spot {
  /** Asset ID of the underlying base asset for the spot product. */
  baseAsset: string;
  /** Asset ID of the underlying quote asset for the spot product. */
  quoteAsset: string;
  /** Name of the instrument. */
  name: string;
}

/** Future product definition */
export interface Future {
  /** Underlying asset for the future. */
  settlementAsset: string;
  /** Quote name of the instrument. */
  quoteName: string;
  /** Data source specification that describes the settlement data source filter. */
  dataSourceSpecForSettlementData:
    | DataSourceSpec
    | undefined;
  /** Data source specification that describes the trading termination data source filter. */
  dataSourceSpecForTradingTermination:
    | DataSourceSpec
    | undefined;
  /** Binding between the data spec and the data source. */
  dataSourceSpecBinding: DataSourceSpecToFutureBinding | undefined;
}

/**
 * DataSourceSpecToFutureBinding describes which property of the data source data is to be
 * used as settlement data and which to use as the trading terminated trigger
 */
export interface DataSourceSpecToFutureBinding {
  /**
   * Name of the property in the source data that should be used as settlement data.
   * If it is set to "prices.BTC.value", then the Future will use the value of
   * this property as settlement data.
   */
  settlementDataProperty: string;
  /** Name of the property in the data source data that signals termination of trading. */
  tradingTerminationProperty: string;
}

/** Instrument metadata definition */
export interface InstrumentMetadata {
  /** List of 0 or more tags. */
  tags: string[];
}

/** Instrument definition */
export interface Instrument {
  /** Unique instrument ID. */
  id: string;
  /** Code for the instrument. */
  code: string;
  /** Name of the instrument. */
  name: string;
  /** Collection of instrument meta-data. */
  metadata:
    | InstrumentMetadata
    | undefined;
  /** Future. */
  future?:
    | Future
    | undefined;
  /** Spot. */
  spot?: Spot | undefined;
}

/** Risk model for log normal */
export interface LogNormalRiskModel {
  /** Risk Aversion Parameter. */
  riskAversionParameter: number;
  /**
   * Tau parameter of the risk model, projection horizon measured as a year fraction used in the expected shortfall
   * calculation to obtain the maintenance margin, must be a strictly non-negative real number.
   */
  tau: number;
  /** Risk model parameters for log normal. */
  params: LogNormalModelParams | undefined;
}

/** Risk model parameters for log normal */
export interface LogNormalModelParams {
  /** Mu parameter, annualised growth rate of the underlying asset. */
  mu: number;
  /** R parameter, annualised growth rate of the risk-free asset, used for discounting of future cash flows, can be any real number. */
  r: number;
  /** Sigma parameter, annualised volatility of the underlying asset, must be a strictly non-negative real number. */
  sigma: number;
}

/** Risk model for simple modelling */
export interface SimpleRiskModel {
  /** Risk model params for simple modelling. */
  params: SimpleModelParams | undefined;
}

/** Risk model parameters for simple modelling */
export interface SimpleModelParams {
  /** Pre-defined risk factor value for long. */
  factorLong: number;
  /** Pre-defined risk factor value for short. */
  factorShort: number;
  /** Pre-defined maximum price move up that the model considers as valid. */
  maxMoveUp: number;
  /** Pre-defined minimum price move down that the model considers as valid. */
  minMoveDown: number;
  /** Pre-defined constant probability of trading. */
  probabilityOfTrading: number;
}

/** Scaling Factors (for use in margin calculation) */
export interface ScalingFactors {
  /**
   * Collateral search level. If collateral dips below this value,
   * the system will search for collateral to release.
   */
  searchLevel: number;
  /**
   * Initial margin level. This is the minimum amount of collateral
   * required to open a position in a market that requires margin.
   */
  initialMargin: number;
  /**
   * Collateral release level. If a trader has collateral above this level,
   * the system will release collateral to a trader's general collateral account
   * for the asset.
   */
  collateralRelease: number;
}

/** Margin Calculator definition */
export interface MarginCalculator {
  /** Scaling factors for margin calculation. */
  scalingFactors: ScalingFactors | undefined;
}

/** Tradable Instrument definition */
export interface TradableInstrument {
  /** Details for the underlying instrument. */
  instrument:
    | Instrument
    | undefined;
  /** Margin calculator for the instrument. */
  marginCalculator:
    | MarginCalculator
    | undefined;
  /** Log normal. */
  logNormalRiskModel?:
    | LogNormalRiskModel
    | undefined;
  /** Simple. */
  simpleRiskModel?: SimpleRiskModel | undefined;
}

/** Fee factors definition */
export interface FeeFactors {
  /** Market maker fee charged network wide. */
  makerFee: string;
  /** Infrastructure fee charged network wide for staking and governance. */
  infrastructureFee: string;
  /** Liquidity fee applied per market for market making. */
  liquidityFee: string;
}

/** Fees definition */
export interface Fees {
  /** Fee factors. */
  factors: FeeFactors | undefined;
}

/** PriceMonitoringTrigger holds together price projection horizon τ, probability level p, and auction extension duration */
export interface PriceMonitoringTrigger {
  /** Price monitoring projection horizon τ in seconds. */
  horizon: number;
  /** Price monitoring probability level p. */
  probability: string;
  /**
   * Price monitoring auction extension duration in seconds should the price
   * breach its theoretical level over the specified horizon at the specified
   * probability level.
   */
  auctionExtension: number;
}

/** PriceMonitoringParameters contains a collection of triggers to be used for a given market */
export interface PriceMonitoringParameters {
  triggers: PriceMonitoringTrigger[];
}

/** PriceMonitoringSettings contains the settings for price monitoring */
export interface PriceMonitoringSettings {
  /** Specifies price monitoring parameters to be used for price monitoring purposes. */
  parameters: PriceMonitoringParameters | undefined;
}

/** LiquidityMonitoringParameters contains settings used for liquidity monitoring */
export interface LiquidityMonitoringParameters {
  /** Specifies parameters related to target stake calculation. */
  targetStakeParameters:
    | TargetStakeParameters
    | undefined;
  /** Specifies the triggering ratio for entering liquidity auction. */
  triggeringRatio: string;
  /** Specifies by how many seconds an auction should be extended if leaving the auction were to trigger a liquidity auction. */
  auctionExtension: number;
}

/** TargetStakeParameters contains parameters used in target stake calculation */
export interface TargetStakeParameters {
  /** Specifies length of time window expressed in seconds for target stake calculation. */
  timeWindow: number;
  /** Specifies scaling factors used in target stake calculation. */
  scalingFactor: number;
}

/** Market definition */
export interface Market {
  /** Unique ID for the market. */
  id: string;
  /** Tradable instrument configuration. */
  tradableInstrument:
    | TradableInstrument
    | undefined;
  /**
   * Number of decimal places that a price must be shifted by in order to get a
   * correct price denominated in the currency of the market, for example:
   * `realPrice = price / 10^decimalPlaces`.
   */
  decimalPlaces: number;
  /** Fees configuration that apply to the market. */
  fees:
    | Fees
    | undefined;
  /**
   * Auction duration specifies how long the opening auction will run (minimum
   * duration and optionally a minimum traded volume).
   */
  openingAuction:
    | AuctionDuration
    | undefined;
  /** PriceMonitoringSettings for the market. */
  priceMonitoringSettings:
    | PriceMonitoringSettings
    | undefined;
  /** LiquidityMonitoringParameters for the market. */
  liquidityMonitoringParameters:
    | LiquidityMonitoringParameters
    | undefined;
  /** Current mode of execution of the market. */
  tradingMode: Market_TradingMode;
  /** Current state of the market. */
  state: Market_State;
  /** Timestamps for when the market state changes. */
  marketTimestamps:
    | MarketTimestamps
    | undefined;
  /** The number of decimal places for a position. */
  positionDecimalPlaces: number;
  /**
   * Percentage move up and down from the mid price which specifies the range of
   * price levels over which automated liquidity provision orders will be deployed.
   */
  lpPriceRange: string;
  /** Linear slippage factor is used to cap the slippage component of maintenance margin - it is applied to the slippage volume. */
  linearSlippageFactor: string;
  /** Quadratic slippage factor is used to cap the slippage component of maintenance margin - it is applied to the square of the slippage volume. */
  quadraticSlippageFactor: string;
  /** ID of the market this market succeeds */
  parentMarketId?:
    | string
    | undefined;
  /** The fraction of the parent market's insurance pool that this market inherits; range 0 through 1. */
  insurancePoolFraction?:
    | string
    | undefined;
  /** ID of the market that succeeds this market if it exists. This will be populated by the system when the successor market is enabled. */
  successorMarketId?: string | undefined;
}

/** Current state of the market */
export enum Market_State {
  /** STATE_UNSPECIFIED - Default value, invalid */
  STATE_UNSPECIFIED = 0,
  /** STATE_PROPOSED - Governance proposal valid and accepted */
  STATE_PROPOSED = 1,
  /** STATE_REJECTED - Outcome of governance votes is to reject the market */
  STATE_REJECTED = 2,
  /** STATE_PENDING - Governance vote passes/wins */
  STATE_PENDING = 3,
  /**
   * STATE_CANCELLED - Market triggers cancellation condition or governance
   * votes to close before market becomes Active
   */
  STATE_CANCELLED = 4,
  /** STATE_ACTIVE - Enactment date reached and usual auction exit checks pass */
  STATE_ACTIVE = 5,
  /** STATE_SUSPENDED - Price monitoring or liquidity monitoring trigger */
  STATE_SUSPENDED = 6,
  /** STATE_CLOSED - Governance vote to close (Not currently implemented) */
  STATE_CLOSED = 7,
  /**
   * STATE_TRADING_TERMINATED - Defined by the product (i.e. from a product parameter,
   * specified in market definition, giving close date/time)
   */
  STATE_TRADING_TERMINATED = 8,
  /** STATE_SETTLED - Settlement triggered and completed as defined by product */
  STATE_SETTLED = 9,
  UNRECOGNIZED = -1,
}

/** Trading mode the market is currently running, also referred to as 'market state' */
export enum Market_TradingMode {
  /** TRADING_MODE_UNSPECIFIED - Default value, this is invalid */
  TRADING_MODE_UNSPECIFIED = 0,
  /** TRADING_MODE_CONTINUOUS - Normal trading */
  TRADING_MODE_CONTINUOUS = 1,
  /** TRADING_MODE_BATCH_AUCTION - Auction trading (FBA) */
  TRADING_MODE_BATCH_AUCTION = 2,
  /** TRADING_MODE_OPENING_AUCTION - Opening auction */
  TRADING_MODE_OPENING_AUCTION = 3,
  /** TRADING_MODE_MONITORING_AUCTION - Auction triggered by monitoring */
  TRADING_MODE_MONITORING_AUCTION = 4,
  /** TRADING_MODE_NO_TRADING - No trading is allowed */
  TRADING_MODE_NO_TRADING = 5,
  UNRECOGNIZED = -1,
}

/** Time stamps for important times about creating, enacting etc the market */
export interface MarketTimestamps {
  /** Time when the market is first proposed. */
  proposed: number;
  /** Time when the market has been voted in and began its opening auction. */
  pending: number;
  /** Time when the market has left the opening auction and is ready to accept trades. */
  open: number;
  /** Time when the market closed. */
  close: number;
}
