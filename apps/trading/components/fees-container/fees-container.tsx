import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import { activeMarketsProvider } from '@vegaprotocol/markets';
import { formatNumber, formatNumberRounded } from '@vegaprotocol/utils';
import { useFeesQuery } from './__generated__/Fees';
import { Card, CardStat, CardTable, CardTableTD, CardTableTH } from '../card';
import { MarketFees } from './market-fees';
import { useVolumeStats } from './use-volume-stats';
import { useReferralStats } from './use-referral-stats';
import { formatPercentage, getAdjustedFee } from './utils';
import { Table as SimpleTable } from '../../components/table';
import BigNumber from 'bignumber.js';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';
import {
  Button,
  Intent,
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { cn } from '@vegaprotocol/ui-toolkit';
import { getTierGradient } from '../helpers/tiers';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  areFactorsEqual,
  type Factors,
  type ReferralBenefitTier,
  useCurrentPrograms,
  type VolumeDiscountBenefitTier,
} from '../../lib/hooks/use-current-programs';
import compact from 'lodash/compact';
import { useState } from 'react';

export const FeesContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);

  const { data: markets } = useDataProvider({
    dataProvider: activeMarketsProvider,
    variables: undefined,
  });

  const {
    referralProgram,
    volumeDiscountProgram,
    loading: currentProgramsLoading,
  } = useCurrentPrograms();

  const volumeDiscountWindowLength =
    volumeDiscountProgram?.details?.windowLength || 1;
  const referralDiscountWindowLength =
    referralProgram?.details?.windowLength || 1;

  const { data: feesData, loading: feesLoading } = useFeesQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  });

  const previousEpoch = (Number(feesData?.epoch.id) || 0) - 1;

  const volumeStats = useVolumeStats(
    previousEpoch,
    feesData?.volumeDiscountStats.edges?.[0]?.node,
    volumeDiscountProgram?.benefitTiers
  );

  const referralStats = useReferralStats(
    previousEpoch,
    feesData?.referralSetStats.edges?.[0]?.node,
    feesData?.referralSetReferees.edges?.[0]?.node,
    referralProgram,
    feesData?.referrer.edges?.[0]?.node,
    feesData?.referee.edges?.[0]?.node
  );

  const loading = paramsLoading || feesLoading || currentProgramsLoading;
  const isConnected = Boolean(pubKey);

  const isReferralProgramRunning = Boolean(referralProgram);
  const isVolumeDiscountProgramRunning = Boolean(volumeDiscountProgram);

  const [showVolumeFactors, setShowVolumeFactors] = useState(false);
  const [showReferralFactors, setShowReferralFactors] = useState(false);

  return (
    <>
      <section
        className="grid auto-rows-min grid-cols-4 gap-3 lg:gap-x-4 lg:gap-y-8"
        data-testid="fees-container"
      >
        {isConnected && (
          <>
            <Card
              title={t('My trading fees')}
              className="sm:col-span-2"
              loading={loading}
            >
              <TradingFees
                params={params}
                markets={markets}
                referralDiscountFactors={referralStats.discountFactors}
                volumeDiscountFactors={volumeStats.discountFactors}
              />
            </Card>
            <Card
              title={t('Total discount')}
              className="sm:col-span-2"
              loading={loading}
            >
              <TotalDiscount
                referralDiscountFactors={referralStats.discountFactors}
                volumeDiscountFactors={volumeStats.discountFactors}
                isReferralProgramRunning={isReferralProgramRunning}
                isVolumeDiscountProgramRunning={isVolumeDiscountProgramRunning}
              />
            </Card>
            <Card
              title={t('My current volume')}
              className="sm:col-span-2"
              loading={loading}
            >
              {isVolumeDiscountProgramRunning ? (
                <CurrentVolume
                  tiers={volumeDiscountProgram?.benefitTiers}
                  currentTier={volumeStats.benefitTier}
                  windowLengthVolume={volumeStats.volume}
                  windowLength={volumeDiscountWindowLength}
                />
              ) : (
                <p
                  className="text-surface-1-fg-muted pt-3 text-sm"
                  data-testid="no-volume-discount"
                >
                  {t('No volume discount program active')}
                </p>
              )}
            </Card>
            <Card
              title={t('Referral benefits')}
              className="sm:col-span-2"
              loading={loading}
              data-testid="referral-benefits-card"
            >
              {referralStats.isReferrer ? (
                <ReferrerInfo
                  code={referralStats.code}
                  data-testid="referrer-info"
                />
              ) : isReferralProgramRunning ? (
                <ReferralBenefits
                  setRunningNotionalTakerVolume={referralStats.volume}
                  epochsInSet={referralStats.epochsInSet}
                  epochs={referralDiscountWindowLength}
                  data-testid="referral-benefits"
                />
              ) : (
                <p
                  className="text-surface-1-fg-muted pt-3 text-sm"
                  data-testid="no-referral-program"
                >
                  {t('No referral program active')}
                </p>
              )}
            </Card>
          </>
        )}
        <div
          className="flex flex-col gap-2 col-span-full lg:col-span-full xl:col-span-2"
          data-testid="volume-discount-card"
        >
          <div className="flex gap-2 justify-between">
            <h3>{t('Volume discount')}</h3>
            <Button
              size="xs"
              intent={Intent.None}
              onClick={() => {
                setShowVolumeFactors(!showVolumeFactors);
              }}
              className="text-surface-0-fg-muted text-xs"
            >
              {showVolumeFactors
                ? t('Hide all factors')
                : t('Show all factors')}
            </Button>
          </div>
          <VolumeTiers
            tiers={volumeDiscountProgram?.benefitTiers}
            currentTier={volumeStats.benefitTier}
            lastEpochVolume={volumeStats.volume}
            windowLength={volumeDiscountWindowLength}
            showFactors={showVolumeFactors}
          />
        </div>
        <div
          className="flex flex-col gap-2 col-span-full lg:col-span-full xl:col-span-2"
          data-testid="referral-discount-card"
        >
          <div className="flex gap-2 justify-between">
            <h3>{t('Referral discount')}</h3>
            <Button
              size="xs"
              intent={Intent.None}
              onClick={() => {
                setShowReferralFactors(!showReferralFactors);
              }}
              className="text-surface-0-fg-muted text-xs"
            >
              {showReferralFactors
                ? t('Hide all factors')
                : t('Show all factors')}
            </Button>
          </div>
          <ReferralTiers
            tiers={referralProgram?.benefitTiers}
            currentTier={referralStats.benefitTier}
            epochsInSet={referralStats.epochsInSet}
            referralVolumeInWindow={referralStats.volume}
            referralDiscountWindowLength={referralDiscountWindowLength}
            showFactors={showReferralFactors}
          />
        </div>
      </section>
      <section
        className="flex flex-col gap-2"
        data-testid="fees-by-market-card"
      >
        <h3>{t('Fees by market')}</h3>
        <MarketFees
          markets={markets}
          referralDiscountFactors={referralStats.discountFactors}
          volumeDiscountFactors={volumeStats.discountFactors}
        />
      </section>
    </>
  );
};

export const TradingFees = ({
  params,
  markets,
  referralDiscountFactors,
  volumeDiscountFactors,
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: Array<{ fees: { factors: { liquidityFee: string } } }> | null;
  referralDiscountFactors: Factors | undefined;
  volumeDiscountFactors: Factors | undefined;
}) => {
  const t = useT();

  const referralDiscounts = referralDiscountFactors
    ? Object.values(referralDiscountFactors).map((d) => new BigNumber(d))
    : [];

  const volumeDiscounts = volumeDiscountFactors
    ? Object.values(volumeDiscountFactors).map((d) => new BigNumber(d))
    : [];

  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total = new BigNumber(params.market_fee_factors_makerFee).plus(
    new BigNumber(params.market_fee_factors_infrastructureFee)
  );

  const adjustedTotal = getAdjustedFee(
    [total],
    [...referralDiscounts, ...volumeDiscounts]
  );

  let minTotal;
  let maxTotal;

  let minAdjustedTotal;
  let maxAdjustedTotal;

  if (minLiq && maxLiq) {
    const minLiqFee = new BigNumber(minLiq.fees.factors.liquidityFee);
    const maxLiqFee = new BigNumber(maxLiq.fees.factors.liquidityFee);

    minTotal = total.plus(minLiqFee);
    maxTotal = total.plus(maxLiqFee);

    minAdjustedTotal = getAdjustedFee(
      [total, minLiqFee],
      [...referralDiscounts, ...volumeDiscounts]
    );

    maxAdjustedTotal = getAdjustedFee(
      [total, maxLiqFee],
      [...referralDiscounts, ...volumeDiscounts]
    );
  }

  return (
    <div className="pt-4" data-testid="trading-fees">
      <div className="leading-none">
        <p className="block text-3xl leading-none" data-testid="adjusted-fees">
          {minAdjustedTotal !== undefined && maxAdjustedTotal !== undefined
            ? `${formatPercentage(minAdjustedTotal)}%-${formatPercentage(
                maxAdjustedTotal
              )}%`
            : `${formatPercentage(adjustedTotal)}%`}
        </p>
        <CardTable>
          <tr data-testid="total-fee-before-discount">
            <CardTableTH>{t('Taker fee before discount')}</CardTableTH>
            <CardTableTD>
              {minTotal !== undefined && maxTotal !== undefined
                ? `${formatPercentage(minTotal.toNumber())}%-${formatPercentage(
                    maxTotal.toNumber()
                  )}%`
                : `${formatPercentage(total.toNumber())}%`}
            </CardTableTD>
          </tr>
          <tr data-testid="infrastructure-fees">
            <CardTableTH>{t('Infrastructure')}</CardTableTH>
            <CardTableTD>
              {formatPercentage(
                Number(params.market_fee_factors_infrastructureFee)
              )}
              %
            </CardTableTD>
          </tr>
          <tr data-testid="maker-fees">
            <CardTableTH>{t('Maker')}</CardTableTH>
            <CardTableTD>
              {formatPercentage(Number(params.market_fee_factors_makerFee))}%
            </CardTableTD>
          </tr>
          {minLiq && maxLiq && (
            <tr data-testid="liquidity-fees">
              <CardTableTH>{t('Liquidity')}</CardTableTH>
              <CardTableTD>
                {formatPercentage(Number(minLiq.fees.factors.liquidityFee))}%
                {'-'}
                {formatPercentage(Number(maxLiq.fees.factors.liquidityFee))}%
              </CardTableTD>
            </tr>
          )}
        </CardTable>
      </div>
    </div>
  );
};

export const CurrentVolume = ({
  tiers,
  currentTier,
  windowLengthVolume,
  windowLength,
}: {
  tiers: VolumeDiscountBenefitTier[] | undefined;
  currentTier: VolumeDiscountBenefitTier | undefined;
  windowLengthVolume: number;
  windowLength: number;
}) => {
  const t = useT();

  const tierIndex =
    tiers && currentTier
      ? tiers.findIndex((t) =>
          areFactorsEqual(t.discountFactors, currentTier.discountFactors)
        )
      : -1;

  const nextTier = tiers?.[tierIndex + 1];
  const requiredForNextTier = nextTier
    ? new BigNumber(nextTier.minimumRunningNotionalTakerVolume).minus(
        windowLengthVolume
      )
    : new BigNumber(0);
  const currentVolume = new BigNumber(windowLengthVolume);

  return (
    <div className="flex flex-col gap-3 pt-4" data-testid="current-volume">
      <CardStat
        value={formatNumberRounded(currentVolume)}
        text={t('pastEpochs', 'Past {{count}} epochs', {
          count: windowLength,
        })}
        testId="past-epochs-volume"
      />
      {requiredForNextTier.isGreaterThan(0) && (
        <CardStat
          value={formatNumber(requiredForNextTier)}
          text={t('Required for next tier')}
          testId="required-for-next-tier"
        />
      )}
    </div>
  );
};

const ReferralBenefits = ({
  epochsInSet,
  setRunningNotionalTakerVolume,
  epochs,
}: {
  epochsInSet: number;
  setRunningNotionalTakerVolume: number;
  epochs: number;
}) => {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 pt-4" data-testid="referral-benefits">
      <CardStat
        // all sets volume (not just current party)
        value={formatNumber(setRunningNotionalTakerVolume)}
        text={t(
          'runningNotionalOverEpochs',
          'Combined running notional over the {{count}} epochs',
          {
            count: epochs,
          }
        )}
        testId="running-notional-taker-volume"
      />
      <CardStat
        value={epochsInSet}
        text={t('epochs in referral set')}
        testId="epochs-in-referral-set"
      />
    </div>
  );
};

const TotalDiscount = ({
  referralDiscountFactors,
  volumeDiscountFactors,
  isReferralProgramRunning,
  isVolumeDiscountProgramRunning,
}: {
  referralDiscountFactors: Factors | undefined;
  volumeDiscountFactors: Factors | undefined;
  isReferralProgramRunning: boolean;
  isVolumeDiscountProgramRunning: boolean;
}) => {
  const t = useT();

  const referralDiscounts = referralDiscountFactors
    ? Object.values(referralDiscountFactors).map((d) => new BigNumber(d))
    : [];

  const volumeDiscounts = volumeDiscountFactors
    ? Object.values(volumeDiscountFactors).map((d) => new BigNumber(d))
    : [];

  const combinedFactors = [...referralDiscounts, ...volumeDiscounts].reduce(
    (acc, d) => {
      return acc.times(new BigNumber(1).minus(d));
    },
    new BigNumber(1)
  );

  const totalDiscount = BigNumber(1).minus(combinedFactors);

  const totalDiscountDescription = t(
    'The total discount is calculated according to the following formula: '
  );
  const formula = (
    <span className="italic">
      1 - (1 - d<sub>volume</sub>) ⋇ (1 - d<sub>referral</sub>)
    </span>
  );

  return (
    <div className="pt-4" data-testid="total-discount-card-stats">
      <CardStat
        description={
          <>
            {totalDiscountDescription}
            {formula}
          </>
        }
        value={formatPercentage(totalDiscount) + '%'}
        highlight={true}
        testId="total-discount"
      />
      <CardTable>
        <tr data-testid="volume-discount-row">
          <CardTableTH>{t('Volume discount')}</CardTableTH>
          <CardTableTD>
            <div className="flex gap-1 justify-end">
              <div>
                {volumeDiscountFactors?.infrastructureFactor
                  ? formatPercentage(volumeDiscountFactors.infrastructureFactor)
                  : 0}
                %
              </div>
              <div>
                {volumeDiscountFactors?.liquidityFactor
                  ? formatPercentage(volumeDiscountFactors.liquidityFactor)
                  : 0}
                %
              </div>
              <div>
                {volumeDiscountFactors?.makerFactor
                  ? formatPercentage(volumeDiscountFactors.makerFactor)
                  : 0}
                %
              </div>
            </div>
            {!isVolumeDiscountProgramRunning && (
              <Tooltip description={t('No active volume discount programme')}>
                <span className="cursor-help">
                  {' '}
                  <VegaIcon name={VegaIconNames.INFO} size={12} />
                </span>
              </Tooltip>
            )}
          </CardTableTD>
        </tr>
        <tr data-testid="referral-discount-row">
          <CardTableTH>{t('Referral discount')}</CardTableTH>
          <CardTableTD>
            <div className="flex gap-1 justify-end">
              <div>
                {referralDiscountFactors?.infrastructureFactor
                  ? formatPercentage(
                      referralDiscountFactors.infrastructureFactor
                    )
                  : 0}
                %
              </div>
              <div>
                {referralDiscountFactors?.liquidityFactor
                  ? formatPercentage(referralDiscountFactors.liquidityFactor)
                  : 0}
                %
              </div>
              <div>
                {referralDiscountFactors?.makerFactor
                  ? formatPercentage(referralDiscountFactors.makerFactor)
                  : 0}
                %
              </div>
            </div>
            {!isReferralProgramRunning && (
              <Tooltip description={t('No active referral programme')}>
                <span className="cursor-help">
                  {' '}
                  <VegaIcon name={VegaIconNames.INFO} size={12} />
                </span>
              </Tooltip>
            )}
          </CardTableTD>
        </tr>
      </CardTable>
    </div>
  );
};

const VolumeTiers = ({
  tiers,
  currentTier,
  lastEpochVolume,
  windowLength,
  showFactors = false,
}: {
  tiers: VolumeDiscountBenefitTier[] | undefined;
  currentTier: VolumeDiscountBenefitTier | undefined;
  lastEpochVolume: number;
  windowLength: number;
  showFactors?: boolean;
}) => {
  const t = useT();
  if (!tiers || !tiers.length) {
    return (
      <p className="text-surface-1-fg-muted text-sm">
        {t('No volume discount program active')}
      </p>
    );
  }

  const tierIndex = currentTier
    ? tiers.findIndex((t) =>
        areFactorsEqual(t.discountFactors, currentTier.discountFactors)
      )
    : -1;

  return (
    <div>
      <SimpleTable
        className="bg-surface-0"
        columns={compact([
          { name: 'tier', displayName: t('Tier'), testId: 'col-tier-value' },
          // discount factors
          ...(showFactors
            ? [
                {
                  name: 'discountInfrastructureFactor',
                  displayName: (
                    <span>
                      d<sub>i</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker infrastructure fees to be discounted"
                  ),
                  className: 'text-xs',
                },
                {
                  name: 'discountMakerFactor',
                  displayName: (
                    <span>
                      d<sub>m</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker maker fees to be discounted"
                  ),
                  className: 'text-xs',
                },
                {
                  name: 'discountLiquidityFactor',
                  displayName: (
                    <span>
                      d<sub>l</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker liquidity fees to be discounted"
                  ),
                  className: 'text-xs',
                },
              ]
            : []),
          {
            name: 'discount',
            displayName: t('Discount'),
            testId: 'discount-value',
          },
          {
            name: 'minTradingVolume',
            displayName: t('Min. trading volume'),
            testId: 'min-volume-value',
          },
          {
            name: 'myVolume',
            displayName: t('myVolume', 'My volume (last {{count}} epochs)', {
              count: windowLength,
            }),
            testId: 'my-volume-value',
          },
          {
            name: 'indicator',
            className: 'max-md:hidden',
            testId: 'your-tier',
          },
        ])}
        data={Array.from(tiers).map((tier, i) => {
          const isUserTier = tierIndex === i;
          const indicator = isUserTier ? (
            <YourTier testId={`your-volume-tier-${i}`} />
          ) : null;
          const tierIndicator = (
            <div className="flex justify-between">
              <span data-testid={`tier-value-${i}`}>{i + 1}</span>
              <span className="md:hidden">{indicator}</span>
            </div>
          );
          return {
            tier: tierIndicator,
            discount: <>{formatPercentage(tier.discountFactor, 2)}%</>, // TODO: This only shows the calculated discount, should it show the factors?
            discountInfrastructureFactor: (
              <span>
                {formatPercentage(tier.discountFactors.infrastructureFactor)}%
              </span>
            ),
            discountLiquidityFactor: (
              <span>
                {formatPercentage(tier.discountFactors.liquidityFactor)}%
              </span>
            ),
            discountMakerFactor: (
              <span>{formatPercentage(tier.discountFactors.makerFactor)}%</span>
            ),
            minTradingVolume: (
              <>{formatNumber(tier.minimumRunningNotionalTakerVolume)}</>
            ),
            myVolume: isUserTier ? (
              formatNumber(lastEpochVolume)
            ) : (
              <span className="md:hidden">-</span>
            ),
            indicator: indicator,
            className: cn(getTierGradient(i + 1, tiers.length), 'text-xs'),
          };
        })}
      />
    </div>
  );
};

const ReferralTiers = ({
  tiers,
  currentTier,
  epochsInSet,
  referralVolumeInWindow,
  referralDiscountWindowLength,
  showFactors = false,
}: {
  tiers: ReferralBenefitTier[] | undefined;
  currentTier: ReferralBenefitTier | undefined;
  epochsInSet: number;
  referralVolumeInWindow: number;
  referralDiscountWindowLength: number;
  showFactors?: boolean;
}) => {
  const t = useT();

  if (!tiers || !tiers.length) {
    return (
      <p className="text-surface-1-fg-muted text-sm">
        {t('No referral program active')}
      </p>
    );
  }

  const tierIndex = currentTier
    ? tiers.findIndex((t) =>
        areFactorsEqual(t.discountFactors, currentTier.discountFactors)
      )
    : -1;

  return (
    <div>
      <SimpleTable
        className="bg-surface-0"
        columns={compact([
          { name: 'tier', displayName: t('Tier'), testId: 'col-tier-value' },
          // discount factors
          ...(showFactors
            ? [
                {
                  name: 'discountInfrastructureFactor',
                  displayName: (
                    <span>
                      d<sub>i</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker infrastructure fees to be discounted"
                  ),
                  className: 'text-xs',
                },
                {
                  name: 'discountMakerFactor',
                  displayName: (
                    <span>
                      d<sub>m</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker maker fees to be discounted"
                  ),
                  className: 'text-xs',
                },
                {
                  name: 'discountLiquidityFactor',
                  displayName: (
                    <span>
                      d<sub>l</sub>
                    </span>
                  ),
                  tooltip: t(
                    "The proportion of the referee's taker liquidity fees to be discounted"
                  ),
                  className: 'text-xs',
                },
              ]
            : []),
          {
            name: 'discount',
            displayName: t('Discount'),
            tooltip: t(
              "The proportion of the referee's taker fees to be discounted"
            ),
            testId: 'discount-value',
          },
          {
            name: 'volume',
            displayName: t(
              'minTradingVolume',
              'Min. trading volume (last {{count}} epochs)',
              {
                count: referralDiscountWindowLength,
              }
            ),
            tooltip: t(
              'The minimum running notional for the given benefit tier'
            ),
            testId: 'min-volume-value',
          },
          {
            name: 'epochs',
            displayName: t('Min. epochs'),
            tooltip: t(
              'The minimum number of epochs the party needs to be in the referral set to be eligible for the benefit'
            ),
            testId: 'required-epochs-value',
          },
          {
            name: 'indicator',
            className: 'max-md:hidden',
            testId: 'user-tier-or-unlocks',
          },
        ])}
        data={Array.from(tiers).map((tier, i) => {
          const isUserTier = tierIndex === i;
          const requiredVolume = Number(tier.minimumRunningNotionalTakerVolume);

          const indicator = isUserTier ? (
            <YourTier testId={`your-referral-tier-${i}`} />
          ) : referralVolumeInWindow >= requiredVolume &&
            epochsInSet < tier.epochs ? (
            <span className="text-surface-1-fg-muted text-xs">
              Unlocks in {tier.epochs - epochsInSet} epochs
            </span>
          ) : null;

          const tierIndicator = (
            <div className="flex justify-between">
              <span data-testid={`tier-value-${i}`}>{i + 1}</span>
              <span className="md:hidden">{indicator}</span>
            </div>
          );

          return {
            tier: tierIndicator,
            discount: <>{formatPercentage(tier.discountFactor, 2)}%</>, // TODO: Same as in volume this shows the calculated discounts, should it show the factors?
            discountInfrastructureFactor: (
              <span>
                {formatPercentage(tier.discountFactors.infrastructureFactor)}%
              </span>
            ),
            discountLiquidityFactor: (
              <span>
                {formatPercentage(tier.discountFactors.liquidityFactor)}%
              </span>
            ),
            discountMakerFactor: (
              <span>{formatPercentage(tier.discountFactors.makerFactor)}%</span>
            ),
            volume: formatNumber(tier.minimumRunningNotionalTakerVolume),
            epochs: tier.epochs,
            indicator,
            className: cn(getTierGradient(i + 1, tiers.length), 'text-xs'),
          };
        })}
      />
    </div>
  );
};

interface YourTierProps {
  testId?: string;
}

const YourTier = ({ testId }: YourTierProps) => {
  const t = useT();

  return (
    <span
      className="bg-gradient-to-r from-highlight-tertiary via-highlight to-highlight-secondary whitespace-nowrap rounded-xl px-4 py-1.5 text-black font-semibold uppercase text-xs"
      data-testid={testId}
    >
      {t('Your tier')}
    </span>
  );
};

const ReferrerInfo = ({ code }: { code?: string }) => {
  const t = useT();

  return (
    <div className="text-surface-2-fg pt-3 text-sm">
      <p className="mb-1">
        {t('Connected key is owner of the referral set')}
        {code && (
          <>
            {' '}
            <span className="bg-rainbow bg-clip-text text-transparent">
              {truncateMiddle(code)}
            </span>
          </>
        )}
        {'. '}
        {t('As owner, it is eligible for commission not fee discounts.')}
      </p>
      <p>
        {t('See')}{' '}
        <Link
          className="text-black underline dark:text-white"
          to={Links.REFERRALS()}
        >
          {t('Referrals')}
        </Link>{' '}
        {t('for more information.')}
      </p>
    </div>
  );
};
