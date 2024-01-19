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
          <Stat value={members ? members.length : 0} label={t('Members')} />
          <Stat
            value={stats ? stats.totalGamesPlayed : 0}
            label={t('Total games')}
            tooltip={t('Total number of games this team has participated in')}
          />
          <StatSectionSeparator />
          <Stat
            value={
              stats
                ? formatNumberRounded(
                    new BigNumber(stats.totalQuantumVolume),
                    '1e3'
                  )
                : 0
            }
            label={t('Total volume')}
          />
          <Stat
            value={
              stats
                ? formatNumberRounded(
                    new BigNumber(stats.totalQuantumRewards),
                    '1e3'
                  )
                : 0
            }
            label={t('Rewards paid')}
            tooltip={'Total amount of rewards paid out to this team in qUSD'}
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
    <dl>
      <dt className="text-muted text-sm">
        {t('Last {{count}} game results', { count: latestGames.length })}
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

const FavoriteGame = ({ games }: { games: TeamGame[] }) => {
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
    <dl>
      <dt className="text-muted text-sm">{t('Favorite game')}</dt>
      <dd>
        <Pill className="flex-inline items-center gap-2 bg-transparent text-sm">
          <VegaIcon
            name={VegaIconNames.STAR}
            className="text-vega-yellow-400"
          />{' '}
          {favoriteMetricLabel}
        </Pill>
      </dd>
    </dl>
  );
};

const StatSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex flex-col lg:flex-row gap-2 lg:gap-8">
      {children}
    </section>
  );
};

const StatSectionSeparator = () => {
  return <div className="hidden md:block border-r border-default" />;
};

const StatList = ({ children }: { children: ReactNode }) => {
  return (
    <dl className="grid grid-cols-2 md:flex gap-4 md:gap-6 lg:gap-8 whitespace-nowrap">
      {children}
    </dl>
  );
};

const Stat = ({
  value,
  label,
  tooltip,
}: {
  value: ReactNode;
  label: ReactNode;
  tooltip?: string;
}) => {
  return (
    <div>
      <dd className="text-3xl lg:text-4xl">{value}</dd>
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
