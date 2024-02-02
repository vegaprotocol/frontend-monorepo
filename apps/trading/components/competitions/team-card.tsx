import { type TeamGame, type TeamStats } from '../../lib/hooks/use-team';
import { type TeamsFieldsFragment } from '../../lib/hooks/__generated__/Teams';
import { TeamAvatar, getFallbackAvatar } from './team-avatar';
import { FavoriteGame, Stat } from './team-stats';
import { useT } from '../../lib/use-t';
import { formatNumberRounded } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { Box } from './box';
import { Intent, Tooltip, TradingAnchorButton } from '@vegaprotocol/ui-toolkit';
import { Links } from '../../lib/links';
import orderBy from 'lodash/orderBy';
import { take } from 'lodash';
import { DispatchMetricLabels } from '@vegaprotocol/types';
import classNames from 'classnames';
import { UpdateTeamButton } from '../../client-pages/competitions/update-team-button';

export const TeamCard = ({
  rank,
  team,
  stats,
  games,
}: {
  rank: number;
  team: TeamsFieldsFragment;
  stats?: TeamStats;
  games?: TeamGame[];
}) => {
  const t = useT();

  const lastGames = take(
    orderBy(
      games?.map((g) => ({
        rank: g.team.rank,
        metric: g.team.rewardMetric,
        epoch: g.epoch,
      })),
      (i) => i.epoch,
      'desc'
    ),
    5
  );

  return (
    <div
      className={classNames(
        'gap-6 grid grid-cols-1 grid-rows-1',
        'md:grid-cols-3'
      )}
    >
      {/** Card */}
      <Box
        backgroundImage={team.avatarUrl || getFallbackAvatar(team.teamId)}
        className="flex flex-col items-center gap-3 min-w-[80px] lg:min-w-[112px]"
      >
        <TeamAvatar teamId={team.teamId} imgUrl={team.avatarUrl} />
        <h1 className="calt lg:text-2xl" data-testid="team-name">
          {team.name}
        </h1>
        {games && <FavoriteGame games={games} noLabel />}
        <TradingAnchorButton
          size="extra-small"
          intent={Intent.Primary}
          href={Links.COMPETITIONS_TEAM(team.teamId)}
        >
          {t('Profile')}
        </TradingAnchorButton>
        <UpdateTeamButton team={team} size="extra-small" />
      </Box>

      {/** Tiles */}
      <Box className="w-full md:col-span-2">
        <div
          className={classNames(
            'grid gap-3 w-full mb-4',
            'md:grid-cols-3 md:grid-rows-2',
            'grid-cols-2 grid-rows-3'
          )}
        >
          <Stat
            className="flex flex-col-reverse"
            value={rank}
            label={t('Rank')}
            valueTestId="team-rank"
          />
          <Stat
            className="flex flex-col-reverse"
            value={team.totalMembers || 0}
            label={t('Members')}
            valueTestId="members-count-stat"
          />
          <Stat
            className="flex flex-col-reverse"
            value={stats?.totalGamesPlayed || 0}
            label={t('Total games')}
            valueTestId="total-games-stat"
          />
          <Stat
            className="flex flex-col-reverse"
            value={
              stats?.totalQuantumVolume
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
            className="flex flex-col-reverse"
            value={
              stats?.totalQuantumRewards
                ? formatNumberRounded(
                    new BigNumber(stats.totalQuantumRewards || 0),
                    '1e3'
                  )
                : 0
            }
            label={t('Rewards paid out')}
            valueTestId="rewards-paid-stat"
          />
        </div>

        <dl className="w-full pt-4 border-t border-vega-clight-700 dark:border-vega-cdark-700">
          <dt className="mb-1 text-sm text-muted">
            {t('Last {{games}} games result', {
              replace: { games: lastGames.length || '' },
            })}
          </dt>
          <dd className="flex flex-row flex-wrap gap-2">
            {lastGames.length === 0 && t('None available')}
            {lastGames.map((game, i) => (
              <Tooltip key={i} description={DispatchMetricLabels[game.metric]}>
                <button className="cursor-help text-sm bg-vega-clight-700 dark:bg-vega-cdark-700 px-2 py-1 rounded-full">
                  <RankLabel rank={game.rank} />
                </button>
              </Tooltip>
            ))}
          </dd>
        </dl>
      </Box>
    </div>
  );
};

/**
 * Sets the english ordinal for given rank only if the current language is set
 * to english.
 */
const RankLabel = ({ rank }: { rank: number }) => {
  const t = useT();
  return t('place', { count: rank, ordinal: true });
};
