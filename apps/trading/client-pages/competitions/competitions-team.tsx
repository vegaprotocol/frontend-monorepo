import { useState, type ButtonHTMLAttributes, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import {
  Splash,
  truncateMiddle,
  Loader,
  Dialog,
  Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  TransferStatus,
  type Asset,
  type RecurringTransfer,
} from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import {
  addDecimalsFormatNumberQuantum,
  formatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
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
import { useEpochInfoQuery } from '../../lib/hooks/__generated__/Epoch';
import {
  type EnrichedTransfer,
  isScopedToTeams,
  useGameCards,
} from '../../lib/hooks/use-game-cards';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import {
  ActiveRewardCard,
  DispatchMetricInfo,
} from '../../components/rewards-container/active-rewards';
import { type MarketMap, useMarketsMapProvider } from '@vegaprotocol/markets';
import format from 'date-fns/format';

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

  const { data: epochData, loading: epochLoading } = useEpochInfoQuery();
  const { data: transfersData, loading: transfersLoading } = useGameCards({
    currentEpoch: Number(epochData?.epoch.id),
    onlyActive: false,
  });

  const { data: markets } = useMarketsMapProvider();

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
      transfers={transfersData}
      transfersLoading={epochLoading || transfersLoading}
      allMarkets={markets || undefined}
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
  transfers,
  transfersLoading,
  allMarkets,
  refetch,
}: {
  team: TeamType;
  partyTeam?: TeamType;
  stats?: ITeamStats;
  members?: Member[];
  games?: TeamGame[];
  gamesLoading?: boolean;
  transfers?: EnrichedTransfer[];
  transfersLoading?: boolean;
  allMarkets?: MarketMap;
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
            {t('Results {{games}}', {
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
          <Games
            games={games}
            gamesLoading={gamesLoading}
            transfers={transfers}
            transfersLoading={transfersLoading}
            allMarkets={allMarkets}
          />
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
  transfers,
  transfersLoading,
  allMarkets,
}: {
  games?: TeamGame[];
  gamesLoading?: boolean;
  transfers?: EnrichedTransfer[];
  transfersLoading?: boolean;
  allMarkets?: MarketMap;
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
    return <p>{t('No game results available')}</p>;
  }

  const dependable = (value: string | JSX.Element) => {
    if (transfersLoading) return <Loader size="small" />;
    return value;
  };

  return (
    <Table
      columns={[
        {
          name: 'epoch',
          displayName: t('Epoch'),
        },
        {
          name: 'endtime',
          displayName: t('End time'),
        },
        { name: 'type', displayName: t('Type') },
        {
          name: 'asset',
          displayName: t('Reward asset'),
        },
        { name: 'daily', displayName: t('Daily reward amount') },
        { name: 'rank', displayName: t('Rank') },
        { name: 'amount', displayName: t('Amount earned this epoch') },
        { name: 'total', displayName: t('Cumulative amount earned') },
        {
          name: 'participatingTeams',
          displayName: t('No. of participating teams'),
        },
        {
          name: 'participatingMembers',
          displayName: t('No. of participating members'),
        },
      ].map((c) => ({ ...c, headerClassName: 'text-left' }))}
      data={games.map((game) => {
        let transfer = transfers?.find((t) => {
          if (!isScopedToTeams(t)) return false;

          const idMatch = t.transfer.gameId === game.id;
          const metricMatch =
            t.transfer.kind.dispatchStrategy?.dispatchMetric ===
            game.team.rewardMetric;

          const start = t.transfer.kind.startEpoch <= game.epoch;
          const end = t.transfer.kind.endEpoch
            ? t.transfer.kind.endEpoch >= game.epoch
            : true;

          const rejected = t.transfer.status === TransferStatus.STATUS_REJECTED;

          return idMatch && metricMatch && start && end && !rejected;
        });
        if (!transfer || !isScopedToTeams(transfer)) transfer = undefined;
        const asset = transfer?.transfer.asset;

        const dailyAmount =
          asset && transfer
            ? addDecimalsFormatNumberQuantum(
                transfer.transfer.amount,
                asset.decimals,
                asset.quantum
              )
            : '-';

        const earnedAmount = asset
          ? addDecimalsFormatNumberQuantum(
              game.team.rewardEarned,
              asset.decimals,
              asset.quantum
            )
          : '-';

        const totalAmount = asset
          ? addDecimalsFormatNumberQuantum(
              game.team.totalRewardsEarned,
              asset.decimals,
              asset.quantum
            )
          : '-';

        const assetSymbol = asset ? <RewardAssetCell asset={asset} /> : '-';

        return {
          id: game.id,
          amount: dependable(earnedAmount),
          asset: dependable(assetSymbol),
          daily: dependable(dailyAmount),
          endtime: <EndTimeCell epoch={game.epoch} />,
          epoch: game.epoch,
          participatingMembers: game.numberOfParticipants,
          participatingTeams: game.entities.length,
          rank: game.team.rank,
          total: totalAmount,
          // type: DispatchMetricLabels[game.team.rewardMetric as DispatchMetric],
          type: dependable(
            <GameTypeCell transfer={transfer} allMarkets={allMarkets} />
          ),
        };
      })}
      noCollapse={false}
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

const EndTimeCell = ({ epoch }: { epoch?: number }) => {
  const { data, loading } = useEpochInfoQuery({
    variables: {
      epochId: epoch ? epoch.toString() : undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) return <Loader size="small" />;
  if (data) {
    return format(
      new Date(data.epoch.timestamps.expiry),
      'yyyy/MM/dd hh:mm:ss'
    );
  }

  return null;
};

const RewardAssetCell = ({ asset }: { asset: Asset }) => {
  const open = useAssetDetailsDialogStore((state) => state.open);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        open(asset.id, ref.current);
      }}
      className="border-b border-dashed border-vega-clight-200 dark:border-vega-cdark-200 text-left text-nowrap whitespace-nowrap"
    >
      {asset.symbol}
    </button>
  );
};

const GameTypeCell = ({
  transfer,
  allMarkets,
}: {
  transfer?: EnrichedTransfer;
  allMarkets?: MarketMap;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  if (!transfer) return '-';
  return (
    <>
      <ActiveRewardCardDialog
        open={open}
        onChange={(isOpen) => setOpen(isOpen)}
        trigger={ref.current}
        transfer={transfer}
        allMarkets={allMarkets}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        ref={ref}
        className="border-b border-dashed border-vega-clight-200 dark:border-vega-cdark-200 text-left md:truncate md:max-w-[25vw]"
      >
        <DispatchMetricInfo transferNode={transfer} allMarkets={allMarkets} />
      </button>
    </>
  );
};

const ActiveRewardCardDialog = ({
  open,
  onChange,
  trigger,
  transfer,
  allMarkets,
}: {
  open: boolean;
  onChange: (isOpen: boolean) => void;
  trigger?: HTMLElement | null;
  transfer: EnrichedTransfer;
  allMarkets?: MarketMap;
}) => {
  const t = useT();
  const { data } = useEpochInfoQuery();
  return (
    <Dialog
      open={open}
      title={t('Game details')}
      onChange={(isOpen) => onChange(isOpen)}
      icon={<VegaIcon name={VegaIconNames.INFO} />}
      onCloseAutoFocus={(e) => {
        /**
         * This mimics radix's default behaviour that focuses the dialog's
         * trigger after closing itself
         */
        if (trigger) {
          e.preventDefault();
          trigger.focus();
        }
      }}
    >
      <div className="py-5 max-w-[454px]">
        <ActiveRewardCard
          transferNode={transfer}
          currentEpoch={Number(data?.epoch.id)}
          kind={transfer.transfer.kind as RecurringTransfer}
          allMarkets={allMarkets}
        />
      </div>
      <div className="w-1/4">
        <Button
          data-testid="close-asset-details-dialog"
          fill={true}
          size="sm"
          onClick={() => onChange(false)}
        >
          {t('Close')}
        </Button>
      </div>
    </Dialog>
  );
};
