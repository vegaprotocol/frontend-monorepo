import minBy from 'lodash/minBy';
import { CodeTile, StatTile } from './tile';
import {
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
  ExternalLink,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';

import { useVegaWallet } from '@vegaprotocol/wallet';
import { DEFAULT_AGGREGATION_DAYS, useReferral } from './hooks/use-referral';
import { CreateCodeContainer } from './create-code-form';
import classNames from 'classnames';
import { Table } from './table';
import {
  addDecimalsFormatNumber,
  getDateFormat,
  getDateTimeFormat,
  getNumberFormat,
  getUserLocale,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { useReferralSetStatsQuery } from './hooks/__generated__/ReferralSetStats';
import compact from 'lodash/compact';
import { useReferralProgram } from './hooks/use-referral-program';
import { useStakeAvailable } from './hooks/use-stake-available';
import sortBy from 'lodash/sortBy';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCurrentEpochInfoQuery } from './hooks/__generated__/Epoch';
import BigNumber from 'bignumber.js';
import { DocsLinks } from '@vegaprotocol/environment';
import { useT, ns } from '../../lib/use-t';
import { Trans } from 'react-i18next';
import { ApplyCodeForm } from './apply-code-form';

export const ReferralStatistics = () => {
  const { pubKey } = useVegaWallet();

  const program = useReferralProgram();

  const { data: referee } = useReferral({
    pubKey,
    role: 'referee',
    aggregationEpochs: program.details?.windowLength,
  });
  const { data: referrer } = useReferral({
    pubKey,
    role: 'referrer',
    aggregationEpochs: program.details?.windowLength,
  });

  if (referee?.code) {
    return (
      <>
        <Statistics data={referee} program={program} as="referee" />;
        {!referee.isEligible && <ApplyCodeForm />}
      </>
    );
  }

  if (referrer?.code) {
    return (
      <>
        <Statistics data={referrer} program={program} as="referrer" />;
        <RefereesTable data={referrer} program={program} />
      </>
    );
  }

  return <CreateCodeContainer />;
};

export const useStats = ({
  data,
  program,
  as,
}: {
  data?: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
  as?: 'referrer' | 'referee';
}) => {
  const { benefitTiers } = program;
  const { data: epochData } = useCurrentEpochInfoQuery();
  const { data: statsData } = useReferralSetStatsQuery({
    variables: {
      code: data?.code || '',
    },
    skip: !data?.code,
    fetchPolicy: 'cache-and-network',
  });

  const currentEpoch = Number(epochData?.epoch.id);

  const stats =
    statsData?.referralSetStats.edges &&
    compact(removePaginationWrapper(statsData.referralSetStats.edges));
  const refereeInfo = data?.referee;
  const refereeStats = stats?.find(
    (r) => r.partyId === data?.referee?.refereeId
  );

  const statsAvailable = stats && stats.length > 0 && stats[0];
  const baseCommissionValue = statsAvailable
    ? Number(statsAvailable.rewardFactor)
    : 0;
  const runningVolumeValue = statsAvailable
    ? Number(statsAvailable.referralSetRunningNotionalTakerVolume)
    : 0;
  const referrerVolumeValue = statsAvailable
    ? Number(statsAvailable.referrerTakerVolume)
    : 0;
  const multiplier = statsAvailable
    ? Number(statsAvailable.rewardsMultiplier)
    : 1;
  const finalCommissionValue = isNaN(multiplier)
    ? baseCommissionValue
    : multiplier * baseCommissionValue;

  const discountFactorValue = refereeStats?.discountFactor
    ? Number(refereeStats.discountFactor)
    : 0;
  const currentBenefitTierValue = benefitTiers.find(
    (t) =>
      !isNaN(discountFactorValue) &&
      !isNaN(t.discountFactor) &&
      t.discountFactor === discountFactorValue
  );
  const nextBenefitTierValue = currentBenefitTierValue
    ? benefitTiers.find((t) => t.tier === currentBenefitTierValue.tier - 1)
    : minBy(benefitTiers, (bt) => bt.tier); //  min tier number is lowest tier
  const epochsValue =
    !isNaN(currentEpoch) && refereeInfo?.atEpoch
      ? currentEpoch - refereeInfo?.atEpoch
      : 0;
  const nextBenefitTierVolumeValue = nextBenefitTierValue
    ? nextBenefitTierValue.minimumVolume - runningVolumeValue
    : 0;
  const nextBenefitTierEpochsValue = nextBenefitTierValue
    ? nextBenefitTierValue.epochs - epochsValue
    : 0;

  return {
    baseCommissionValue,
    runningVolumeValue,
    referrerVolumeValue,
    multiplier,
    finalCommissionValue,
    discountFactorValue,
    currentBenefitTierValue,
    nextBenefitTierValue,
    epochsValue,
    nextBenefitTierVolumeValue,
    nextBenefitTierEpochsValue,
  };
};

export const Statistics = ({
  data,
  program,
  as,
}: {
  data: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
  as: 'referrer' | 'referee';
}) => {
  const t = useT();
  const {
    baseCommissionValue,
    runningVolumeValue,
    referrerVolumeValue,
    multiplier,
    finalCommissionValue,
    discountFactorValue,
    currentBenefitTierValue,
    epochsValue,
    nextBenefitTierVolumeValue,
    nextBenefitTierEpochsValue,
  } = useStats({ data, program, as });

  const isApplyCodePreview = useMemo(
    () => data.referee === null,
    [data.referee]
  );

  const { benefitTiers } = useReferralProgram();

  const { stakeAvailable, isEligible } = useStakeAvailable();
  const { details } = program;

  const compactNumFormat = new Intl.NumberFormat(getUserLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short',
  });

  const baseCommissionTile = (
    <StatTile
      title={t('Base commission rate')}
      description={t(
        '(Combined set volume {{runningVolume}} over last {{epochs}} epochs)',
        {
          runningVolume: compactNumFormat.format(runningVolumeValue),
          epochs: (
            details?.windowLength || DEFAULT_AGGREGATION_DAYS
          ).toString(),
        }
      )}
      testId="base-commission-rate"
    >
      {baseCommissionValue * 100}%
    </StatTile>
  );

  const stakingMultiplierTile = (
    <StatTile
      title={t('Staking multiplier')}
      testId="staking-multiplier"
      description={
        <span
          className={classNames({
            'text-vega-red': !isEligible,
          })}
        >
          {t('{{amount}} $VEGA staked', {
            amount: addDecimalsFormatNumber(
              stakeAvailable?.toString() || 0,
              18
            ),
          })}
        </span>
      }
    >
      {multiplier || t('None')}
    </StatTile>
  );
  const finalCommissionTile = (
    <StatTile
      title={t('Final commission rate')}
      description={
        !isNaN(multiplier)
          ? `(${baseCommissionValue * 100}% ⨉ ${multiplier} = ${
              finalCommissionValue * 100
            }%)`
          : undefined
      }
      testId="final-commission-rate"
    >
      {finalCommissionValue * 100}%
    </StatTile>
  );
  const numberOfTradersValue = data.referees.length;
  const numberOfTradersTile = (
    <StatTile title={t('Number of traders')} testId="number-of-traders">
      {numberOfTradersValue}
    </StatTile>
  );

  const codeTile = (
    <CodeTile
      code={data?.code}
      createdAt={getDateFormat().format(new Date(data.createdAt))}
    />
  );

  const referrerVolumeTile = (
    <StatTile
      title={t('myVolume', 'My volume (last {{count}} epochs)', {
        count: details?.windowLength || DEFAULT_AGGREGATION_DAYS,
      })}
      testId="my-volume"
    >
      {compactNumFormat.format(referrerVolumeValue)}
    </StatTile>
  );

  const totalCommissionValue = data.referees
    .map((r) => new BigNumber(r.totalRefereeGeneratedRewards))
    .reduce((all, r) => all.plus(r), new BigNumber(0));
  const totalCommissionTile = (
    <StatTile
      title={t('totalCommission', 'Total commission (last {{count}}} epochs)', {
        count: details?.windowLength || DEFAULT_AGGREGATION_DAYS,
      })}
      description={<QUSDTooltip />}
      testId="total-commission"
    >
      {getNumberFormat(0).format(Number(totalCommissionValue))}
    </StatTile>
  );

  const referrerTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
        {baseCommissionTile}
        {stakingMultiplierTile}
        {finalCommissionTile}
      </div>

      <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {codeTile}
        {referrerVolumeTile}
        {numberOfTradersTile}
        {totalCommissionTile}
      </div>
    </>
  );

  const currentBenefitTierTile = (
    <StatTile title={t('Current tier')} testId="current-tier">
      {isApplyCodePreview
        ? currentBenefitTierValue?.tier || benefitTiers[0]?.tier || 'None'
        : currentBenefitTierValue?.tier || 'None'}
    </StatTile>
  );
  const discountFactorTile = (
    <StatTile title={t('Discount')} testId="discount">
      {isApplyCodePreview
        ? benefitTiers[0].discountFactor * 100
        : discountFactorValue * 100}
      %
    </StatTile>
  );
  const runningVolumeTile = (
    <StatTile
      title={t(
        'runningNotionalOverEpochs',
        'Combined volume (last {{count}} epochs)',
        {
          count: details?.windowLength,
        }
      )}
      testId="combined-volume"
    >
      {compactNumFormat.format(runningVolumeValue)}
    </StatTile>
  );
  const epochsTile = (
    <StatTile title={t('Epochs in set')} testId="epochs-in-set">
      {epochsValue}
    </StatTile>
  );
  const nextTierVolumeTile = (
    <StatTile title={t('Volume to next tier')} testId="vol-to-next-tier">
      {nextBenefitTierVolumeValue <= 0
        ? '0'
        : compactNumFormat.format(nextBenefitTierVolumeValue)}
    </StatTile>
  );
  const nextTierEpochsTile = (
    <StatTile title={t('Epochs to next tier')} testId="epochs-to-next-tier">
      {nextBenefitTierEpochsValue <= 0 ? '0' : nextBenefitTierEpochsValue}
    </StatTile>
  );

  const refereeTiles = (
    <>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
        {currentBenefitTierTile}
        {runningVolumeTile}
        {codeTile}
      </div>
      <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {discountFactorTile}
        {nextTierVolumeTile}
        {epochsTile}
        {nextTierEpochsTile}
      </div>
    </>
  );

  const eligibilityWarning = as === 'referee' && !isEligible && (
    <div
      data-testid="referral-eligibility-warning"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-1/2 lg:w-1/3"
    >
      <h2 className="text-2xl mb-2">{t('Referral code no longer valid')}</h2>
      <p>
        {t(
          'Your referral code is no longer valid as the referrer no longer meets the minimum requirements. Apply a new code to continue receiving discounts.'
        )}
      </p>
    </div>
  );

  return (
    <div
      data-testid="referral-statistics"
      data-as={as}
      className="relative mx-auto mb-20"
    >
      <div
        className={classNames('grid grid-cols-1 grid-rows-1 gap-5', {
          'opacity-20 pointer-events-none': as === 'referee' && !isEligible,
        })}
      >
        {as === 'referrer' && referrerTiles}
        {as === 'referee' && refereeTiles}
      </div>

      {eligibilityWarning}
    </div>
  );
};

export const RefereesTable = ({
  data,
  program,
}: {
  data: NonNullable<ReturnType<typeof useReferral>['data']>;
  program: ReturnType<typeof useReferralProgram>;
}) => {
  const t = useT();
  const [collapsed, setCollapsed] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const { details } = program;
  useLayoutEffect(() => {
    if ((tableRef.current?.getBoundingClientRect().height || 0) > 384) {
      setCollapsed(true);
    }
  }, []);
  return (
    <>
      {/* Referees (only for referrer view) */}
      {data.referees.length > 0 && (
        <div className="mt-20 mb-20">
          <h2 className="mb-5 text-2xl">{t('Referees')}</h2>
          <div
            className={classNames(
              collapsed && [
                'relative max-h-96 overflow-hidden',
                'after:w-full after:h-20 after:absolute after:bottom-0 after:left-0',
                'after:bg-gradient-to-t after:from-white after:dark:from-vega-cdark-900 after:to-transparent',
              ]
            )}
          >
            <button
              className={classNames(
                'absolute left-1/2 bottom-0 z-10 p-2 translate-x-[-50%]',
                {
                  hidden: !collapsed,
                }
              )}
              onClick={() => setCollapsed(false)}
            >
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={24} />
            </button>
            <Table
              ref={tableRef}
              columns={[
                { name: 'party', displayName: t('Trader') },
                { name: 'joined', displayName: t('Date Joined') },
                {
                  name: 'volume',
                  displayName: t(
                    'volumeLastEpochs',
                    'Volume (last {{count}} epochs)',
                    {
                      count: details?.windowLength || DEFAULT_AGGREGATION_DAYS,
                    }
                  ),
                },
                {
                  name: 'commission',
                  displayName: (
                    <Trans
                      i18nKey="referralStatisticsCommission"
                      defaults="Commission earned in <0>qUSD</0> (last {{count}} epochs)"
                      values={{
                        count:
                          details?.windowLength || DEFAULT_AGGREGATION_DAYS,
                      }}
                      ns={ns}
                    />
                  ),
                },
              ]}
              data={sortBy(
                data.referees.map((r) => ({
                  party: (
                    <span title={r.refereeId}>
                      {truncateMiddle(r.refereeId)}
                    </span>
                  ),
                  joined: getDateTimeFormat().format(new Date(r.joinedAt)),
                  volume: Number(r.totalRefereeNotionalTakerVolume),
                  commission: Number(r.totalRefereeGeneratedRewards),
                })),
                (r) => r.volume
              )
                .map((r) => ({
                  ...r,
                  volume: getNumberFormat(0).format(r.volume),
                  commission: getNumberFormat(0).format(r.commission),
                }))
                .reverse()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const QUSDTooltip = () => {
  const t = useT();
  return (
    <Tooltip
      description={
        <>
          <p className="mb-1">
            {t(
              'qUSD provides a rough USD equivalent of balances across all assets using the value of "Quantum" for that asset'
            )}
          </p>
          {DocsLinks && (
            <ExternalLink href={DocsLinks.QUANTUM}>
              {t('Find out more')}
            </ExternalLink>
          )}
        </>
      }
      underline={true}
    >
      <span>{t('qUSD')}</span>
    </Tooltip>
  );
};
