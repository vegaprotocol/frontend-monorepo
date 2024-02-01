import { type ReactNode } from 'react';
import BigNumber from 'bignumber.js';
import countBy from 'lodash/countBy';
import {
  Pill,
  VegaIcon,
  VegaIconNames,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { formatNumberRounded } from '@vegaprotocol/utils';
import {
  type TeamStats as ITeamStats,
  type Member,
  type TeamGame,
} from '../../lib/hooks/use-team';
import { useT } from '../../lib/use-t';
import { DispatchMetricLabels, type DispatchMetric } from '@vegaprotocol/types';
import classNames from 'classnames';

export const TeamStats = ({
  stats,
  members,
  games,
}: {
  stats?: ITeamStats;
  members?: Member[];
  games?: TeamGame[];
}) => {
  const t = useT();
  return (
    <>
      <StatSection>
        <StatList>
          <Stat
            value={members ? members.length : 0}
            label={t('Members')}
            valueTestId="members-count-stat"
          />
          <Stat
            value={stats ? stats.totalGamesPlayed : 0}
            label={t('Total games')}
            tooltip={t('Total number of games this team has participated in')}
            valueTestId="total-games-stat"
          />
          <StatSectionSeparator />
          <Stat
            value={
              stats
                ? formatNumberRounded(
                    new BigNumber(stats.totalQuantumVolume || 0),
                    '1e3'
                  )
                : 0
            }
            label={t('Total volume')}
            valueTestId="total-volume-stat"
          />
          <Stat
            value={
              stats
                ? formatNumberRounded(
                    new BigNumber(stats.totalQuantumRewards || 0),
                    '1e3'
                  )
                : 0
            }
            label={t('Rewards paid out')}
            tooltip={'Total amount of rewards paid out to this team in qUSD'}
            valueTestId="rewards-paid-stat"
          />
        </StatList>
      </StatSection>
      {games && games.length ? (
        <StatSection>
          <FavoriteGame games={games} />
          <StatSectionSeparator />
          <LatestResults games={games} />
        </StatSection>
      ) : null}
    </>
  );
};

const LatestResults = ({ games }: { games: TeamGame[] }) => {
  const t = useT();
  const latestGames = games.slice(0, 5);

  return (
    <dl className="flex flex-col gap-1">
      <dt className="text-muted text-sm">
        {t('gameCount', { count: latestGames.length })}
      </dt>
      <dd className="flex gap-1">
        {latestGames.map((game) => {
          return (
            <Pill key={game.id} className="text-sm">
              {t('place', { count: game.team.rank, ordinal: true })}
            </Pill>
          );
        })}
      </dd>
    </dl>
  );
};

export const FavoriteGame = ({
  games,
  noLabel = false,
}: {
  games: TeamGame[];
  noLabel?: boolean;
}) => {
  const t = useT();

  const rewardMetrics = games.map(
    (game) => game.team.rewardMetric as DispatchMetric
  );
  const count = countBy(rewardMetrics);

  let favoriteMetric = '';
  let mostOccurances = 0;

  for (const key in count) {
    if (count[key] > mostOccurances) {
      favoriteMetric = key;
      mostOccurances = count[key];
    }
  }

  if (!favoriteMetric) return null;

  // rewardMetric is a string, should be typed as DispatchMetric
  const favoriteMetricLabel =
    DispatchMetricLabels[favoriteMetric as DispatchMetric];

  return (
    <dl className="flex flex-col gap-1">
      <dt
        className={classNames('text-muted text-sm', {
          hidden: noLabel,
        })}
      >
        {t('Favorite game')}
      </dt>
      <dd>
        <Pill className="inline-flex items-center gap-1 bg-transparent text-sm">
          <VegaIcon
            name={VegaIconNames.STAR}
            className="text-vega-yellow-400 relative top-[-1px]"
          />{' '}
          {favoriteMetricLabel}
        </Pill>
      </dd>
    </dl>
  );
};

export const StatSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {children}
    </section>
  );
};

export const StatSectionSeparator = () => {
  return <div className="hidden md:block border-r border-default" />;
};

export const StatList = ({ children }: { children: ReactNode }) => {
  return (
    <dl className="grid grid-cols-2 md:flex gap-4 md:gap-6 lg:gap-8 whitespace-nowrap">
      {children}
    </dl>
  );
};

export const Stat = ({
  value,
  label,
  tooltip,
  valueTestId,
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  tooltip?: string;
  valueTestId?: string;
  className?: classNames.Argument;
}) => {
  return (
    <div className={classNames(className)}>
      <dd className="text-3xl lg:text-4xl" data-testid={valueTestId}>
        {value}
      </dd>
      <dt className="text-sm text-muted">
        {tooltip ? (
          <Tooltip description={tooltip} underline={false}>
            <span className="flex items-center gap-2">
              {label}
              <VegaIcon name={VegaIconNames.INFO} size={12} />
            </span>
          </Tooltip>
        ) : (
          label
        )}
      </dt>
    </div>
  );
};
