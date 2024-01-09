import { useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import {
  TradingButton as Button,
  Intent,
  Pill,
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
  Tooltip,
  Splash,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import {
  useTeam,
  type Team as TeamType,
  type TeamStats,
  type Member,
  type TeamGame,
} from './use-team';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { DApp, EXPLORER_PARTIES, useLinks } from '@vegaprotocol/environment';

export const Team = () => {
  const t = useT();
  const { teamId } = useParams<{ teamId: string }>();
  const { pubKey } = useVegaWallet();
  const { team, stats, partyInTeam, members, games } = useTeam(
    teamId,
    pubKey || undefined
  );

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
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-black to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        <header className="flex gap-2 lg:gap-4 pt-5 lg:pt-10">
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
            <Stat value={members ? members.length : 0} label={'Members'} />
            <Stat
              value={stats ? stats.totalGamesPlayed : 0}
              label={'Total games'}
              tooltip={'My games description'}
            />
          </StatList>
          <StatSectionSeparator />
          <StatList>
            <Stat
              value={stats ? stats.totalQuantumVolume : 0}
              label={'Total volume'}
            />
            <Stat
              value={stats ? stats.totalQuantumRewards : 0}
              label={'Rewards paid'}
              tooltip={'My rewards paid description'}
            />
          </StatList>
        </StatSection>
        <StatSection>
          <dl>
            <dt className="text-muted text-sm">Favorite game</dt>
            <dd>
              <Pill className="flex-inline items-center gap-2 bg-transparent text-sm">
                <VegaIcon
                  name={VegaIconNames.STAR}
                  className="text-vega-yellow-400"
                />{' '}
                Maker fees played
              </Pill>
            </dd>
          </dl>
          <StatSectionSeparator />
          <dl>
            <dt className="text-muted text-sm">Last 5 game results</dt>
            <dd className="flex gap-1">
              {new Array(4).fill(null).map((_, i) => {
                return (
                  <Pill key={i} className="text-sm">
                    {t('place', { count: i + 1, ordinal: true })}
                  </Pill>
                );
              })}
            </dd>
          </dl>
        </StatSection>
        <section>
          <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
            <ToggleButton active={showGames} onClick={() => setShowGames(true)}>
              Games ({games ? games.length : 0})
            </ToggleButton>
            <ToggleButton
              active={!showGames}
              onClick={() => setShowGames(false)}
            >
              Members ({members ? members.length : 0})
            </ToggleButton>
          </div>
          {showGames ? <Games games={games} /> : <Members members={members} />}
        </section>
      </div>
    </div>
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

const Games = ({ games }: { games?: TeamGame[] }) => {
  if (!games?.length) {
    return <p>No games</p>;
  }

  return (
    <Table
      columns={[
        { name: 'rank', displayName: 'Rank' },
        {
          name: 'epoch',
          displayName: 'Epoch',
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'type', displayName: 'Type' },
        { name: 'amount', displayName: 'Amount earned' },
        {
          name: 'teams',
          displayName: 'No. of participating teams',
          headerClassName: 'hidden md:block',
          className: 'hidden md:block',
        },
        { name: 'status', displayName: 'Status' },
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
      className="rounded-full w-14 h-14 lg:w-[112px] lg:h-[112px] bg-vega-clight-700 dark:bg-vega-cdark-700 shrink-0"
    />
  );
};

const Members = ({ members }: { members?: Member[] }) => {
  if (!members?.length) {
    return <p>No members</p>;
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
        { name: 'referee', displayName: 'Referee' },
        {
          name: 'joinedAt',
          displayName: 'Joined at',
        },
        { name: 'joinedAtEpoch', displayName: 'Joined epoch' },
        { name: 'explorerLink', displayName: '', className: 'text-right' },
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
  const linkCreator = useLinks(DApp.Explorer);
  const link = linkCreator(EXPLORER_PARTIES.replace(':id', pubkey));
  return (
    <Link to={link} className="underline underline-offset-4">
      View on explorer
    </Link>
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
  return <div className="hidden lg:block border-r border-default" />;
};

const StatList = ({ children }: { children: ReactNode }) => {
  return <dl className="flex gap-4 lg:gap-8">{children}</dl>;
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

const JoinButton = ({ joined }: { joined: boolean }) => {
  const [open, setOpen] = useState(false);
  if (joined) {
    return (
      <div className="flex items-center gap-1">
        <Button intent={Intent.None} disabled={true}>
          <span className="flex items-center gap-2">
            Joined{' '}
            <span className="text-vega-green-600 dark:text-vega-green">
              <VegaIcon name={VegaIconNames.TICK} />
            </span>
          </span>
        </Button>
        <TradingDropdown
          onOpenChange={setOpen}
          open={open}
          trigger={
            <TradingDropdownTrigger>
              <button className="p-2">
                <VegaIcon name={VegaIconNames.KEBAB} size={24} />
              </button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownContent>
            <TradingDropdownItem>Leave team</TradingDropdownItem>
          </TradingDropdownContent>
        </TradingDropdown>
      </div>
    );
  }

  return <Button intent={Intent.Primary}>Join this team</Button>;
};
