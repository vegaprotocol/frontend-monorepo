import { useState, type ButtonHTMLAttributes } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import { Splash, truncateMiddle, Loader } from '@vegaprotocol/ui-toolkit';
import { DispatchMetricLabels, type DispatchMetric } from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import { formatNumber, getDateTimeFormat } from '@vegaprotocol/utils';
import {
  useTeam,
  type TeamStats as ITeamStats,
  type Team as TeamType,
  type Member,
} from '../../lib/hooks/use-team';
import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { TeamStats } from '../../components/competitions/team-stats';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { LayoutWithGradient } from '../../components/layouts-inner';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { JoinTeam } from './join-team';
import { UpdateTeamButton } from './update-team-button';
import {
  type TeamGame,
  useGames,
  areTeamGames,
} from '../../lib/hooks/use-games';

export const CompetitionsTeam = () => {
  const t = useT();
  const { teamId } = useParams<{ teamId: string }>();
  usePageTitle([t('Competitions'), t('Team')]);
  return (
    <ErrorBoundary feature="team">
      <TeamPageContainer teamId={teamId} />
    </ErrorBoundary>
  );
};

const TeamPageContainer = ({ teamId }: { teamId: string | undefined }) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, team, partyTeam, stats, members, loading, refetch } = useTeam(
    teamId,
    pubKey || undefined
  );

  const { data: games, loading: gamesLoading } = useGames(teamId);

  // only show spinner on first load so when users join teams its smoother
  if (!data && loading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!team) {
    return (
      <Splash>
        <p>{t('Page not found')}</p>
      </Splash>
    );
  }

  return (
    <TeamPage
      team={team}
      partyTeam={partyTeam}
      stats={stats}
      members={members}
      games={areTeamGames(games) ? games : undefined}
      gamesLoading={gamesLoading}
      refetch={refetch}
    />
  );
};

const TeamPage = ({
  team,
  partyTeam,
  stats,
  members,
  games,
  gamesLoading,
  refetch,
}: {
  team: TeamType;
  partyTeam?: TeamType;
  stats?: ITeamStats;
  members?: Member[];
  games?: TeamGame[];
  gamesLoading?: boolean;
  refetch: () => void;
}) => {
  const t = useT();
  const [showGames, setShowGames] = useState(true);

  return (
    <LayoutWithGradient>
      <header className="flex gap-3 lg:gap-4 pt-5 lg:pt-10">
        <TeamAvatar teamId={team.teamId} imgUrl={team.avatarUrl} />
        <div className="flex flex-col items-start gap-1 lg:gap-3">
          <h1
            className="calt text-2xl lg:text-3xl xl:text-5xl"
            data-testid="team-name"
          >
            {team.name}
          </h1>
          <div className="flex gap-2">
            <JoinTeam team={team} partyTeam={partyTeam} refetch={refetch} />
            <UpdateTeamButton team={team} />
          </div>
        </div>
      </header>
      <TeamStats stats={stats} members={members} games={games} />
      <section>
        <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
          <ToggleButton
            active={showGames}
            onClick={() => setShowGames(true)}
            data-testid="games-toggle"
          >
            {t('Games {{games}}', {
              replace: {
                games: gamesLoading ? '' : games ? `(${games.length})` : '(0)',
              },
            })}
          </ToggleButton>
          <ToggleButton
            active={!showGames}
            onClick={() => setShowGames(false)}
            data-testid="members-toggle"
          >
            {t('Members ({{count}})', {
              count: members ? members.length : 0,
            })}
          </ToggleButton>
        </div>
        {showGames ? (
          <Games games={games} gamesLoading={gamesLoading} />
        ) : (
          <Members members={members} />
        )}
      </section>
    </LayoutWithGradient>
  );
};

const Games = ({
  games,
  gamesLoading,
}: {
  games?: TeamGame[];
  gamesLoading?: boolean;
}) => {
  const t = useT();

  if (gamesLoading) {
    return (
      <div className="w-[15px]">
        <Loader size="small" />
      </div>
    );
  }

  if (!games?.length) {
    return <p>{t('No games')}</p>;
  }

  return (
    <Table
      columns={[
        { name: 'rank', displayName: t('Rank') },
        {
          name: 'epoch',
          displayName: t('Epoch'),
          headerClassName: 'hidden md:table-cell',
          className: 'hidden md:table-cell',
        },
        { name: 'type', displayName: t('Type') },
        { name: 'amount', displayName: t('Amount earned') },
        {
          name: 'participatingTeams',
          displayName: t('No. of participating teams'),
          headerClassName: 'hidden md:table-cell',
          className: 'hidden md:table-cell',
        },
        {
          name: 'participatingMembers',
          displayName: t('No. of participating members'),
          headerClassName: 'hidden md:table-cell',
          className: 'hidden md:table-cell',
        },
      ]}
      data={games.map((game) => ({
        rank: game.team.rank,
        epoch: game.epoch,
        type: DispatchMetricLabels[game.team.rewardMetric as DispatchMetric],
        amount: formatNumber(game.team.totalRewardsEarned),
        participatingTeams: game.entities.length,
        participatingMembers: game.numberOfParticipants,
      }))}
      noCollapse={true}
    />
  );
};

const Members = ({ members }: { members?: Member[] }) => {
  const t = useT();

  if (!members?.length) {
    return <p>{t('No members')}</p>;
  }

  const data = orderBy(
    members.map((m) => ({
      referee: <RefereeLink pubkey={m.referee} isCreator={m.isCreator} />,
      rewards: formatNumber(m.totalQuantumRewards),
      volume: formatNumber(m.totalQuantumVolume),
      gamesPlayed: formatNumber(m.totalGamesPlayed),
      joinedAt: getDateTimeFormat().format(new Date(m.joinedAt)),
      joinedAtEpoch: Number(m.joinedAtEpoch),
    })),
    'joinedAtEpoch',
    'desc'
  );

  return (
    <Table
      columns={[
        { name: 'referee', displayName: t('Member ID') },
        { name: 'rewards', displayName: t('Rewards earned') },
        { name: 'volume', displayName: t('Total volume') },
        { name: 'gamesPlayed', displayName: t('Games played') },
        {
          name: 'joinedAt',
          displayName: t('Joined at'),
        },
        {
          name: 'joinedAtEpoch',
          displayName: t('Joined epoch'),
        },
      ]}
      data={data}
      noCollapse={true}
    />
  );
};

const RefereeLink = ({
  pubkey,
  isCreator,
}: {
  pubkey: string;
  isCreator: boolean;
}) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Explorer);
  const link = linkCreator(EXPLORER_PARTIES.replace(':id', pubkey));

  return (
    <>
      <Link to={link} target="_blank" className="underline underline-offset-4">
        {truncateMiddle(pubkey)}
      </Link>{' '}
      <span className="text-muted text-xs">{isCreator ? t('Owner') : ''}</span>
    </>
  );
};

const ToggleButton = ({
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) => {
  return (
    <button
      {...props}
      className={classNames('relative top-px uppercase border-b-2 py-4', {
        'text-muted border-transparent': !active,
        'border-vega-yellow': active,
      })}
    />
  );
};
