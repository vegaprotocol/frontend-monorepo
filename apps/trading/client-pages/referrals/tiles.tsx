import {
  addDecimalsFormatNumber,
  formatNumber,
  getDateFormat,
} from '@vegaprotocol/utils';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { useT } from '../../lib/use-t';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { type ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { type StatValue, COMPACT_NUMBER_FORMAT } from './constants';
import { type ReferrerStats } from './hooks/use-referrer-stats';
import { type RefereeStats } from './hooks/use-referee-stats';
import { QUSDTooltip } from './qusd-tooltip';
import { NoProgramTile, StatTile, Tile } from './tile';
import {
  Loader,
  TextChildrenTooltip as Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { type BenefitTier } from './hooks/use-referral-program';
import { areTeamGames } from '../../lib/hooks/use-games';
import { TeamCard } from '../../components/competitions/team-card';
import { useMyTeam } from '../../lib/hooks/use-my-team';

/* Formatters */

const percentageFormatter = (value: BigNumber) =>
  value.times(100).toFixed(2) + '%';

const compactFormatter =
  (maximumFractionDigits = 2) =>
  (value: BigNumber) =>
    value.isGreaterThan(99999)
      ? COMPACT_NUMBER_FORMAT(maximumFractionDigits).format(value.toNumber())
      : formatNumber(value, maximumFractionDigits);

const valueFormatter = (noValueLabel: string) => (value: BigNumber) => {
  if (value.isNaN() || value.isZero()) {
    return noValueLabel;
  }
  return value.toString();
};

export const dateFormatter = (value: string) => {
  try {
    return getDateFormat().format(new Date(value));
  } catch {
    return '-';
  }
};

/* Helpers */

const Value = <T,>({
  data: { value, loading, error },
  formatter,
}: {
  data: StatValue<T>;
  formatter: (value: T) => ReactNode;
}) => {
  if (loading) {
    return (
      <span className="p-[33px]">
        <Loader size="small" />
      </span>
    );
  }
  if (error) {
    return <span data-error={error.message}>-</span>;
  }

  return formatter(value);
};

/* Referrer tiles */

export const BaseCommissionTile = ({
  baseCommission,
  runningVolume,
  aggregationEpochs,
}: {
  baseCommission: ReferrerStats['baseCommission'];
  runningVolume: ReferrerStats['runningVolume'];
  aggregationEpochs: number;
}) => {
  const t = useT();

  const runningVolumeDescription = compactFormatter(2)(runningVolume.value);
  const description = t(
    '(Combined set volume {{runningVolume}} over last {{epochs}} epochs)',
    {
      runningVolume: runningVolumeDescription,
      epochs: aggregationEpochs.toString(),
    }
  );

  return (
    <StatTile
      title={t('Base commission rate')}
      description={description}
      testId="base-commission-rate"
    >
      <Value data={baseCommission} formatter={percentageFormatter} />
    </StatTile>
  );
};

export const StakingMultiplierTile = ({
  multiplier,
}: {
  multiplier: ReferrerStats['multiplier'];
}) => {
  const t = useT();
  const { stakeAvailable, isEligible } = useStakeAvailable();

  const description = (
    <span
      className={classNames({
        'text-vega-red': !isEligible,
      })}
    >
      {t('{{amount}} $VEGA staked', {
        amount: addDecimalsFormatNumber(stakeAvailable?.toString() || 0, 18),
      })}
    </span>
  );

  return (
    <StatTile
      title={t('Staking multiplier')}
      description={description}
      testId="staking-multiplier"
    >
      <Value data={multiplier} formatter={valueFormatter(t('None'))} />
    </StatTile>
  );
};

export const FinalCommissionTile = ({
  baseCommission,
  multiplier,
  finalCommission,
}: {
  baseCommission: ReferrerStats['baseCommission'];
  multiplier: ReferrerStats['multiplier'];
  finalCommission: ReferrerStats['finalCommission'];
}) => {
  const t = useT();

  const description =
    !baseCommission.loading && !finalCommission.loading && !multiplier.loading
      ? `(${percentageFormatter(
          baseCommission.value
        )} * ${multiplier.value.toString()} = ${percentageFormatter(
          finalCommission.value
        )})`
      : undefined;

  return (
    <StatTile
      title={t('Final commission rate')}
      description={description}
      testId="final-commission-rate"
    >
      <Value data={finalCommission} formatter={percentageFormatter} />
    </StatTile>
  );
};

export const VolumeTile = ({
  volume,
  aggregationEpochs,
}: {
  volume: ReferrerStats['volume'];
  aggregationEpochs: number;
}) => {
  const t = useT();

  return (
    <StatTile
      title={t('myVolume', 'My volume (last {{count}} epochs)', {
        count: aggregationEpochs,
      })}
      testId="my-volume"
    >
      <Value data={volume} formatter={compactFormatter(2)} />
    </StatTile>
  );
};

export const TotalCommissionTile = ({
  totalCommission,
  aggregationEpochs,
}: {
  totalCommission: ReferrerStats['totalCommission'];
  aggregationEpochs: number;
}) => {
  const t = useT();

  return (
    <StatTile
      testId="total-commission"
      title={
        <Trans
          i18nKey="totalCommission"
          defaults="Total commission (<0>last {{count}} epochs</0>)"
          values={{
            count: aggregationEpochs,
          }}
          components={[
            <Tooltip
              key="0"
              description={t(
                'Depending on data node retention you may not be able see the full 30 days'
              )}
            >
              last 30 epochs
            </Tooltip>,
          ]}
        />
      }
      description={<QUSDTooltip />}
    >
      <Value data={totalCommission} formatter={compactFormatter(0)} />
    </StatTile>
  );
};

export const RefereesTile = ({
  referees,
}: {
  referees: ReferrerStats['referees'];
}) => {
  const t = useT();
  return (
    <StatTile title={t('Number of traders')} testId="number-of-traders">
      <Value data={referees} formatter={valueFormatter(t('None'))} />
    </StatTile>
  );
};

/* Referee tiles */

export const BenefitTierTile = ({
  benefitTier,
  nextBenefitTier,
}: {
  benefitTier: RefereeStats['benefitTier'];
  nextBenefitTier: RefereeStats['nextBenefitTier'];
}) => {
  const t = useT();

  const formatter = (value: BenefitTier | undefined) =>
    value?.tier || t('None');

  const next = nextBenefitTier.value?.tier;

  return (
    <StatTile
      title={t('Current tier')}
      testId="current-tier"
      description={
        next
          ? t('(Next tier: {{nextTier}})', {
              nextTier: next,
            })
          : undefined
      }
    >
      <Value<BenefitTier | undefined>
        data={benefitTier}
        formatter={formatter}
      />
    </StatTile>
  );
};

export const RunningVolumeTile = ({
  runningVolume,
  aggregationEpochs,
}: {
  runningVolume: RefereeStats['runningVolume'];
  aggregationEpochs: number;
}) => {
  const t = useT();
  return (
    <StatTile
      title={t(
        'runningNotionalOverEpochs',
        'Combined volume (last {{count}} epochs)',
        {
          count: aggregationEpochs,
        }
      )}
      testId="combined-volume"
    >
      <Value data={runningVolume} formatter={compactFormatter(2)} />
    </StatTile>
  );
};

export const DiscountTile = ({
  discountFactor,
}: {
  discountFactor: RefereeStats['discountFactor'];
}) => {
  const t = useT();
  return (
    <StatTile title={t('Discount')} testId="discount">
      <Value data={discountFactor} formatter={percentageFormatter} />
    </StatTile>
  );
};

export const NextTierVolumeTile = ({
  runningVolume,
  nextBenefitTier,
}: {
  runningVolume: RefereeStats['runningVolume'];
  nextBenefitTier: RefereeStats['nextBenefitTier'];
}) => {
  const t = useT();

  const data = {
    loading: runningVolume.loading || nextBenefitTier.loading,
    error: runningVolume.error || nextBenefitTier.error,
    value: [runningVolume.value, nextBenefitTier.value] as [
      BigNumber,
      BenefitTier | undefined
    ],
  };

  const formatter = ([runningVolume, nextBenefitTier]: [
    BigNumber,
    BenefitTier | undefined
  ]) => {
    if (!nextBenefitTier) return '0';
    const volume = BigNumber(nextBenefitTier.minimumVolume).minus(
      runningVolume
    );
    if (volume.isNaN() || volume.isLessThan(0)) return '0';
    return compactFormatter(0)(volume);
  };

  return (
    <StatTile title={t('Volume to next tier')} testId="vol-to-next-tier">
      <Value<[BigNumber, BenefitTier | undefined]>
        data={data}
        formatter={formatter}
      />
    </StatTile>
  );
};

export const EpochsTile = ({ epochs }: { epochs: RefereeStats['epochs'] }) => {
  const t = useT();
  return (
    <StatTile title={t('Epochs in set')} testId="epochs-in-set">
      <Value data={epochs} formatter={valueFormatter(t('None'))} />
    </StatTile>
  );
};

export const NextTierEpochsTile = ({
  epochs,
  nextBenefitTier,
}: {
  epochs: RefereeStats['epochs'];
  nextBenefitTier: RefereeStats['nextBenefitTier'];
}) => {
  const t = useT();

  const data = {
    value: [epochs.value, nextBenefitTier.value] as [
      BigNumber,
      BenefitTier | undefined
    ],
    loading: epochs.loading || nextBenefitTier.loading,
    error: epochs.error || nextBenefitTier.error,
  };

  const formatter = ([epochs, nextBenefitTier]: [
    BigNumber,
    BenefitTier | undefined
  ]) => {
    if (!nextBenefitTier) return '-';
    const value = BigNumber(nextBenefitTier.epochs).minus(epochs);
    if (value.isLessThan(0)) {
      return '0';
    }
    return value.toString(10);
  };

  return (
    <StatTile title={t('Epochs to next tier')} testId="epochs-to-next-tier">
      <Value data={data} formatter={formatter} />
    </StatTile>
  );
};

/* Additional settings */

/**
 * A list for tiles that should be replaced with `NoProgramTile`
 * when the referral program is not set.
 */
const NO_PROGRAM_TILES = {
  [BaseCommissionTile.name]: 'Base commission rate',
  [StakingMultiplierTile.name]: 'Staking multiplier',
  [FinalCommissionTile.name]: 'Final commission rate',
  [VolumeTile.name]: 'My volume',
  [BenefitTierTile.name]: 'Current tier',
  [DiscountTile.name]: 'Discount',
  [RunningVolumeTile.name]: 'Combined volume',
  [NextTierEpochsTile.name]: 'Epochs to next tier',
  [NextTierVolumeTile.name]: 'Volume to next tier',
};

export const NoProgramTileFor = ({ tile }: { tile: string }) => {
  const t = useT();
  if (Object.keys(NO_PROGRAM_TILES).includes(tile)) {
    return <NoProgramTile title={t(NO_PROGRAM_TILES[tile])} />;
  }
  return null;
};

/** Teams */

export const TeamTile = ({ teamId }: { teamId?: string }) => {
  const {
    team: myTeam,
    stats: myTeamStats,
    games: myTeamGames,
    rank: myTeamRank,
  } = useMyTeam({ teamId });

  if (!myTeam) return null;

  return (
    <Tile>
      <TeamCard
        team={myTeam}
        rank={myTeamRank}
        stats={myTeamStats}
        games={areTeamGames(myTeamGames) ? myTeamGames : undefined}
      />
    </Tile>
  );
};
