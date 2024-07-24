import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import { activeMarketsProvider } from '@vegaprotocol/markets';
import { formatNumber, formatNumberRounded } from '@vegaprotocol/utils';
import { useDiscountProgramsQuery, useFeesQuery } from './__generated__/Fees';
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
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import classNames from 'classnames';
import { getTierGradient } from '../helpers/tiers';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const FeesContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);

  const { data: markets, loading: marketsLoading } = useDataProvider({
    dataProvider: activeMarketsProvider,
    variables: undefined,
  });

  const { data: programData, loading: programLoading } =
    useDiscountProgramsQuery({
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-and-network',
      pollInterval: 15000,
    });

  const volumeDiscountWindowLength =
    programData?.currentVolumeDiscountProgram?.windowLength || 1;
  const referralDiscountWindowLength =
    programData?.currentReferralProgram?.windowLength || 1;
  const { data: feesData, loading: feesLoading } = useFeesQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000,
  });

  const previousEpoch = (Number(feesData?.epoch.id) || 0) - 1;

  const { volumeDiscount, volumeTierIndex, volumeInWindow, volumeTiers } =
    useVolumeStats(
      previousEpoch,
      feesData?.volumeDiscountStats.edges?.[0]?.node,
      programData?.currentVolumeDiscountProgram
    );

  const {
    referralDiscount,
    referralVolumeInWindow,
    referralTierIndex,
    referralTiers,
    epochsInSet,
    code,
    isReferrer,
  } = useReferralStats(
    previousEpoch,
    feesData?.referralSetStats.edges?.[0]?.node,
    feesData?.referralSetReferees.edges?.[0]?.node,
    programData?.currentReferralProgram,
    feesData?.referrer.edges?.[0]?.node,
    feesData?.referee.edges?.[0]?.node
  );

  const loading = paramsLoading || feesLoading || programLoading;
  const isConnected = Boolean(pubKey);

  const isReferralProgramRunning = Boolean(programData?.currentReferralProgram);
  const isVolumeDiscountProgramRunning = Boolean(
    programData?.currentVolumeDiscountProgram
  );

  return (
    <>
      <section
        className="grid auto-rows-min grid-cols-4 gap-3"
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
                referralDiscount={referralDiscount}
                volumeDiscount={volumeDiscount}
              />
            </Card>
            <Card
              title={t('Total discount')}
              className="sm:col-span-2"
              loading={loading}
            >
              <TotalDiscount
                referralDiscount={referralDiscount}
                volumeDiscount={volumeDiscount}
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
                  tiers={volumeTiers}
                  tierIndex={volumeTierIndex}
                  windowLengthVolume={volumeInWindow}
                  windowLength={volumeDiscountWindowLength}
                />
              ) : (
                <p
                  className="text-muted pt-3 text-sm"
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
              {isReferrer ? (
                <ReferrerInfo code={code} data-testid="referrer-info" />
              ) : isReferralProgramRunning ? (
                <ReferralBenefits
                  setRunningNotionalTakerVolume={referralVolumeInWindow}
                  epochsInSet={epochsInSet}
                  epochs={referralDiscountWindowLength}
                  data-testid="referral-benefits"
                />
              ) : (
                <p
                  className="text-muted pt-3 text-sm"
                  data-testid="no-referral-program"
                >
                  {t('No referral program active')}
                </p>
              )}
            </Card>
          </>
        )}
        <Card
          title={t('Volume discount')}
          className="lg:col-span-full xl:col-span-2"
          loading={loading}
          data-testid="volume-discount-card"
          noBackgroundOnMobile={true}
        >
          <VolumeTiers
            tiers={volumeTiers}
            tierIndex={volumeTierIndex}
            lastEpochVolume={volumeInWindow}
            windowLength={volumeDiscountWindowLength}
          />
        </Card>
        <Card
          title={t('Referral discount')}
          className="lg:col-span-full xl:col-span-2"
          loading={loading}
          data-testid="referral-discount-card"
          noBackgroundOnMobile={true}
        >
          <ReferralTiers
            tiers={referralTiers}
            tierIndex={referralTierIndex}
            epochsInSet={epochsInSet}
            referralVolumeInWindow={referralVolumeInWindow}
            referralDiscountWindowLength={referralDiscountWindowLength}
          />
        </Card>
      </section>
      <section>
        <Card
          title={t('Fees by market')}
          loading={marketsLoading}
          data-testid="fees-by-market-card"
          noBackgroundOnMobile={true}
        >
          <MarketFees
            markets={markets}
            referralDiscount={referralDiscount}
            volumeDiscount={volumeDiscount}
          />
        </Card>
      </section>
    </>
  );
};

export const TradingFees = ({
  params,
  markets,
  referralDiscount,
  volumeDiscount,
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: Array<{ fees: { factors: { liquidityFee: string } } }> | null;
  referralDiscount: number;
  volumeDiscount: number;
}) => {
  const t = useT();
  const referralDiscountBigNum = new BigNumber(referralDiscount);
  const volumeDiscountBigNum = new BigNumber(volumeDiscount);

  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total = new BigNumber(params.market_fee_factors_makerFee).plus(
    new BigNumber(params.market_fee_factors_infrastructureFee)
  );

  const adjustedTotal = getAdjustedFee(
    [total],
    [referralDiscountBigNum, volumeDiscountBigNum]
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
      [referralDiscountBigNum, volumeDiscountBigNum]
    );

    maxAdjustedTotal = getAdjustedFee(
      [total, maxLiqFee],
      [referralDiscountBigNum, volumeDiscountBigNum]
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
          <tr className="text-default" data-testid="total-fee-before-discount">
            <CardTableTH>{t('Total fee before discount')}</CardTableTH>
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
  tierIndex,
  windowLengthVolume,
  windowLength,
}: {
  tiers: Array<{ minimumRunningNotionalTakerVolume: string }>;
  tierIndex: number;
  windowLengthVolume: number;
  windowLength: number;
}) => {
  const t = useT();
  const nextTier = tiers[tierIndex + 1];
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
  referralDiscount,
  volumeDiscount,
  isReferralProgramRunning,
  isVolumeDiscountProgramRunning,
}: {
  referralDiscount: number;
  volumeDiscount: number;
  isReferralProgramRunning: boolean;
  isVolumeDiscountProgramRunning: boolean;
}) => {
  const t = useT();
  const totalDiscount = 1 - (1 - volumeDiscount) * (1 - referralDiscount);
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
            {formatPercentage(volumeDiscount)}%
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
            {formatPercentage(referralDiscount)}%
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
  tierIndex,
  lastEpochVolume,
  windowLength,
}: {
  tiers: Array<{
    volumeDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
  }>;
  tierIndex: number;
  lastEpochVolume: number;
  windowLength: number;
}) => {
  const t = useT();
  if (!tiers.length) {
    return (
      <p className="text-muted text-sm">
        {t('No volume discount program active')}
      </p>
    );
  }

  return (
    <div>
      <SimpleTable
        className="bg-white dark:bg-vega-cdark-900"
        columns={[
          { name: 'tier', displayName: t('Tier'), testId: 'col-tier-value' },
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
        ]}
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
            discount: (
              <>{formatPercentage(Number(tier.volumeDiscountFactor))}%</>
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
            className: classNames(
              getTierGradient(i + 1, tiers.length),
              'text-xs'
            ),
          };
        })}
      />
    </div>
  );
};

const ReferralTiers = ({
  tiers,
  tierIndex,
  epochsInSet,
  referralVolumeInWindow,
  referralDiscountWindowLength,
}: {
  tiers: Array<{
    referralDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
    minimumEpochs: number;
  }>;
  tierIndex: number;
  epochsInSet: number;
  referralVolumeInWindow: number;
  referralDiscountWindowLength: number;
}) => {
  const t = useT();

  if (!tiers.length) {
    return (
      <p className="text-muted text-sm">{t('No referral program active')}</p>
    );
  }

  return (
    <div>
      <SimpleTable
        className="bg-white dark:bg-vega-cdark-900"
        columns={[
          { name: 'tier', displayName: t('Tier'), testId: 'col-tier-value' },
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
        ]}
        data={Array.from(tiers).map((tier, i) => {
          const isUserTier = tierIndex === i;
          const requiredVolume = Number(tier.minimumRunningNotionalTakerVolume);

          const indicator = isUserTier ? (
            <YourTier testId={`your-referral-tier-${i}`} />
          ) : referralVolumeInWindow >= requiredVolume &&
            epochsInSet < tier.minimumEpochs ? (
            <span className="text-muted text-xs">
              Unlocks in {tier.minimumEpochs - epochsInSet} epochs
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
            discount: (
              <>{formatPercentage(Number(tier.referralDiscountFactor))}%</>
            ),
            volume: formatNumber(tier.minimumRunningNotionalTakerVolume),
            epochs: tier.minimumEpochs,
            indicator,
            className: classNames(
              getTierGradient(i + 1, tiers.length),
              'text-xs'
            ),
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
      className="bg-rainbow whitespace-nowrap rounded-xl px-4 py-1.5 text-white text-xs"
      data-testid={testId}
    >
      {t('Your tier')}
    </span>
  );
};

const ReferrerInfo = ({ code }: { code?: string }) => {
  const t = useT();

  return (
    <div className="text-vega-clight-200 dark:vega-cdark-200 pt-3 text-sm">
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
