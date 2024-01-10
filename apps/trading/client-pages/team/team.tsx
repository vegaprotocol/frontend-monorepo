import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import countBy from 'lodash/countBy';
import {
  TradingButton as Button,
  Intent,
  Pill,
  VegaIcon,
  VegaIconNames,
  Tooltip,
  Splash,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import { formatNumberRounded, getDateTimeFormat } from '@vegaprotocol/utils';
import {
  useTeam,
  type Team as TeamType,
  type TeamStats,
  type Member,
  type TeamGame,
} from './use-team';
import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';
import BigNumber from 'bignumber.js';

export const Team = () => {
  const t = useT();
  const { teamId } = useParams<{ teamId: string }>();
  const { team, stats, partyInTeam, members, games } = useTeam(teamId);

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
      stats={stats}
      partyInTeam={partyInTeam}
      members={members}
      games={games}
    />
  );
};

export const TeamPage = ({
  team,
  stats,
  partyInTeam,
  members,
  games,
}: {
  team: TeamType;
  stats?: TeamStats;
  partyInTeam: boolean;
  members?: Member[];
  games?: TeamGame[];
}) => {
  const t = useT();
  const [showGames, setShowGames] = useState(true);

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-vega-cdark-900 to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        <header className="flex gap-3 lg:gap-4 pt-5 lg:pt-10">
          <TeamAvatar imgUrl={team.avatarUrl} />
          <div className="flex flex-col items-start gap-1 lg:gap-3">
            <h1 className="calt text-2xl lg:text-3xl xl:text-5xl">
              {team.name}
            </h1>
            <JoinButton joined={partyInTeam} />
          </div>
        </header>
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
                  ? formatNumberRounded(new BigNumber(stats.totalQuantumVolume))
                  : 0
              }
              label={t('Total volume')}
            />
            <Stat
              value={
                stats
                  ? formatNumberRounded(
                      new BigNumber(stats.totalQuantumRewards)
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
        <section>
          <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
            <ToggleButton active={showGames} onClick={() => setShowGames(true)}>
              {t('Games ({{count}})', { count: games ? games.length : 0 })}
            </ToggleButton>
            <ToggleButton
              active={!showGames}
              onClick={() => setShowGames(false)}
            >
              {t('Members ({{count}})', {
                count: members ? members.length : 0,
              })}
            </ToggleButton>
          </div>
          {showGames ? <Games games={games} /> : <Members members={members} />}
        </section>
      </div>
    </div>
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

const TeamAvatar = ({ imgUrl }: { imgUrl: string }) => {
  // TODO: add fallback avatars
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt="Team avatar"
      className="rounded-full w-20 h-20 lg:w-[112px] lg:h-[112px] bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0"
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
          headerClassName: 'text-right',
          className: 'text-right',
        },
        {
          name: 'explorerLink',
          displayName: '',
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
    <Link to={link} className="underline underline-offset-4">
      {t('View on explorer')}
    </Link>
  );
};

const JoinButton = ({ joined }: { joined: boolean }) => {
  const t = useT();

  if (joined) {
    return (
      <Button intent={Intent.None} disabled={true}>
        <span className="flex items-center gap-2">
          {t('Joined')}{' '}
          <span className="text-vega-green-600 dark:text-vega-green">
            <VegaIcon name={VegaIconNames.TICK} />
          </span>
        </span>
      </Button>
    );
  }

  return <Button intent={Intent.Primary}>{t('Join this team')}</Button>;
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

  const rewardMetrics = games.map((game) => game.team.rewardMetric);
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

  return (
    <dl>
      <dt className="text-muted text-sm">{t('Favorite game')}</dt>
      <dd>
        <Pill className="flex-inline items-center gap-2 bg-transparent text-sm">
          <VegaIcon
            name={VegaIconNames.STAR}
            className="text-vega-yellow-400"
          />{' '}
          {favoriteMetric}
        </Pill>
      </dd>
    </dl>
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
    <dl className="grid grid-cols-[min-content_min-content] md:flex gap-4 md:gap-6 lg:gap-8 whitespace-nowrap">
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
