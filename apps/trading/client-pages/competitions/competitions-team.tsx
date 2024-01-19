import { useState, type ButtonHTMLAttributes } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import { Splash, truncateMiddle, Loader } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import {
  useTeam,
  type TeamStats as ITeamStats,
  type Team as TeamType,
  type Member,
  type TeamGame,
} from '../../lib/hooks/use-team';
import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { TeamStats } from '../../components/competitions/team-stats';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { ErrorBoundary } from '../../components/error-boundary';
import { LayoutWithGradient } from '../../components/layouts-inner';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { JoinTeam } from './join-team';

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
  const { team, partyTeam, stats, members, games, loading, refetch } = useTeam(
    teamId,
    pubKey || undefined
  );

  if (loading) {
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
      games={games}
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
  refetch,
}: {
  team: TeamType;
  partyTeam?: TeamType;
  stats?: ITeamStats;
  members?: Member[];
  games?: TeamGame[];
  refetch: () => void;
}) => {
  const t = useT();
  const [showGames, setShowGames] = useState(true);

  return (
    <LayoutWithGradient>
      <header className="flex gap-3 lg:gap-4 pt-5 lg:pt-10">
        <TeamAvatar teamId={team.teamId} imgUrl={team.avatarUrl} />
        <div className="flex flex-col items-start gap-1 lg:gap-3">
          <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">{team.name}</h1>
          <JoinTeam team={team} partyTeam={partyTeam} refetch={refetch} />
        </div>
      </header>
      <TeamStats stats={stats} members={members} games={games} />
      <section>
        <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
          <ToggleButton active={showGames} onClick={() => setShowGames(true)}>
            {t('Games ({{count}})', { count: games ? games.length : 0 })}
          </ToggleButton>
          <ToggleButton active={!showGames} onClick={() => setShowGames(false)}>
            {t('Members ({{count}})', {
              count: members ? members.length : 0,
            })}
          </ToggleButton>
        </div>
        {showGames ? <Games games={games} /> : <Members members={members} />}
      </section>
    </LayoutWithGradient>
  );
};

const Games = ({ games }: { games?: TeamGame[] }) => {
  const t = useT();

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
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'type', displayName: t('Type') },
        { name: 'amount', displayName: t('Amount earned') },
        {
          name: 'teams',
          displayName: t('No. of participating teams'),
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'status', displayName: t('Status') },
      ]}
      data={games.map((game) => ({
        rank: game.team.rank,
        epoch: game.epoch,
        type: game.team.rewardMetric,
        amount: game.team.totalRewardsEarned,
        teams: game.numberOfParticipants,
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
      referee: <RefereeCell pubkey={m.referee} />,
      joinedAt: getDateTimeFormat().format(new Date(m.joinedAt)),
      joinedAtEpoch: Number(m.joinedAtEpoch),
      explorerLink: <RefereeLink pubkey={m.referee} />,
    })),
    'joinedAtEpoch',
    'desc'
  );

  return (
    <Table
      columns={[
        { name: 'referee', displayName: t('Referee') },
        {
          name: 'joinedAt',
          displayName: t('Joined at'),
        },
        {
          name: 'joinedAtEpoch',
          displayName: t('Joined epoch'),
        },
        {
          name: 'explorerLink',
          displayName: <span className="invisible">Actions</span>, // ensure header doesn't collapse
          headerClassName: 'hidden md:block',
          className: 'hidden md:block text-right',
        },
      ]}
      data={data}
      noCollapse={true}
    />
  );
};

const RefereeCell = ({ pubkey }: { pubkey: string }) => {
  return <span title={pubkey}>{truncateMiddle(pubkey)}</span>;
};

const RefereeLink = ({ pubkey }: { pubkey: string }) => {
  const t = useT();

  const linkCreator = useLinks(DApp.Explorer);
  const link = linkCreator(EXPLORER_PARTIES.replace(':id', pubkey));

  return (
    <Link to={link} target="_blank" className="underline underline-offset-4">
      {t('View on explorer')}
    </Link>
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
