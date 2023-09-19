import { ExternalLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import type { ReactNode } from 'react';

export const tooltipMapping: Record<string, ReactNode> = {
  makerFee: t(
    'Maker portion of the fee is transferred to the non-aggressive, or passive party in the trade (the maker, as opposed to the taker).'
  ),
  liquidityFee: t(
    'Liquidity portion of the fee is paid to liquidity providers, and is transferred to the liquidity fee pool for the market.'
  ),
  infrastructureFee: t(
    'Fees paid to validators as a reward for running the infrastructure of the network.'
  ),

  markPrice: t(
    'A concept derived from traditional markets. It is a calculated value for the ‘current market price’ on a market.'
  ),
  quoteUnit: t(
    `The underlying that is being priced by the market, described by the market's oracle.`
  ),
  openInterest: t(
    'The volume of all open positions in a given market (the sum of the size of all positions greater than 0).'
  ),
  indicativeVolume: t(
    'The volume at which all trades would occur if the auction was uncrossed now (when in auction mode).'
  ),
  bestBidVolume: t(
    'The aggregated volume being bid at the best bid price on the market.'
  ),
  bestOfferVolume: t(
    'The aggregated volume being offered at the best offer price on the market.'
  ),
  bestStaticBidVolume: t(
    'The aggregated volume being bid at the best static bid price on the market.'
  ),
  bestStaticOfferVolume: t(
    'The aggregated volume being offered at the best static offer price on the market.'
  ),
  marketDecimalPlaces: t('The smallest price increment on the book.'),
  decimalPlaces: t('The smallest price increment on the book.'),
  positionDecimalPlaces: t(
    'How big the smallest order / position on the market can be.'
  ),
  tradingMode: t('The trading mode the market is currently running.'),
  state: t('The current state of the market'),

  base: t(
    'The first currency in a pair for a currency-based derivatives market.'
  ),
  quote: t(
    'The second currency in a pair for a currency-based derivatives market.'
  ),
  class: t(
    'The classification of the product. Examples: shares, commodities, crypto, FX.'
  ),
  sector: t(
    'Data about the sector. Example: "automotive" for a market based on value of Tesla shares.'
  ),

  short: t(
    'A number that will be calculated by an appropriate stochastic risk model, dependent on the type of risk model used and its parameters.'
  ),
  long: t(
    'A number that will be calculated by an appropriate stochastic risk model, dependent on the type of risk model used and its parameters.'
  ),

  tau: (
    <span>
      {t('Projection horizon measured as a year fraction used in ')}
      <ExternalLink href={ExternalLinks.MARGIN_CREDIT_RISK}>
        {t('Expected Shortfall')}
      </ExternalLink>
      {t(' calculation when obtaining Risk Factor Long and Risk Factor Short')}
    </span>
  ),
  riskAversionParameter: (
    <span>
      {t('Probability level used in ')}
      <ExternalLink href={ExternalLinks.MARGIN_CREDIT_RISK}>
        {t('Expected Shortfall')}
      </ExternalLink>
      {t(' calculation when obtaining Risk Factor Long and Risk Factor Short')}
    </span>
  ),

  horizonSecs: t('Time horizon of the price projection in seconds.'),
  probability: t(
    'Probability level for price projection, e.g. value of 0.95 will result in a price range such that over the specified projection horizon, the prices observed in the market should be in that range 95% of the time.'
  ),
  auctionExtensionSecs: t(
    'Auction extension duration in seconds, should the price breach its theoretical level over the specified horizon at the specified probability level.'
  ),

  triggeringRatio: t('The triggering ratio for entering liquidity auction.'),
  timeWindow: t('The length of time over which open interest is measured.'),
  scalingFactor: t(
    'The scaling between the liquidity demand estimate, based on open interest and target stake.'
  ),
  targetStake: t(
    `The market's liquidity requirement which is derived from the maximum open interest observed over a rolling time window.`
  ),
  suppliedStake: t('The current amount of liquidity supplied for this market.'),
  parentMarketID: t('The ID of the market this market succeeds.'),
  insurancePoolFraction: t(
    'The fraction of the insurance pool balance that is carried over from the parent market to the successor.'
  ),
  commitmentMinimumTimeFraction: t(
    `Specifies the minimum fraction of time LPs must spend 'on the book' providing their committed liquidity. This is a market parameter.`
  ),
  feeCalculationTimeStep: t(
    'How often the quality of liquidity supplied by each liquidity provider is evaluated and the fees arising from that period are earmarked for specific providers. This is a market parameter. '
  ),
  performanceHysteresisEpochs: t(
    'Number of epochs over which past performance will continue to affect rewards. This is a market parameter.'
  ),
  SLACompetitionFactor: t(
    `Maximum fraction of an LP's accrued fees that an LP would lose to liquidity providers that achieved a higher SLA performance than them. This is a market parameter. `
  ),
  bondPenaltyParameter: t(
    'Used to calculate the penalty to liquidity providers when they cannot support their open position with the assets in their margin and general accounts. This is a network parameter.'
  ),
  nonPerformanceBondPenaltySlope: t(
    'A sliding penalty for how much an LP bond is slashed if an LP fails to reach the minimum SLA. This is a network parameter.'
  ),
  nonPerformanceBondPenaltyMax: t(
    'The maximum amount, as a fraction, that an LP's bond can be slashed by if they fail to reach the minimum SLA. This is a network parameter.'
  ),
  maximumLiquidityFeeFactorLevel: t(
    'This is a network parameter. It is used to validate the proposed fee amounts that are submitted as part of the LP commitment transaction. Note that a value of 0.05 = 5%. Valid values are: any decimal number >=0 and <=1. Default value 1.'
  ),
  stakeToCCYVolume: t(
    `Multiplier used to translate an LP's commitment amount to their liquidity obligation. This is a network parameter.`
  ),
  epochLength: t(
    'How long an epoch is. LP rewards from liquidity fees are paid out once per epoch. How much they receive depends on whether they met the liquidity SLA and their previous performance in recent epochs. This is a network parameter.'
  ),
  earlyExitPenalty: t(
    `How much an LP forfeits of their bond if they reduce their commitment while the market is below target stake. If set to 0 there is no penalty for early exit. If set to 1 an LP's entire bond is forfeited when an LP removes their full commitment. This is a network parameter.`
  ),
  probabilityOfTradingTauScaling: t(
    `Determines how the probability of trading is scaled from the risk model, and is used to measure the relative competitiveness of an LP's supplied volume. This is a network parameter.`
  ),
  minimumProbabilityOfTradingLPOrders: t(
    'The lower bound for the probability of trading calculation, used to measure liquidity available on a market to determine if LPs are meeting their commitment. This is a network parameter.'
  ),
};
