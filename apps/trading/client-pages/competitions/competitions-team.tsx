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
  Tooltip,
  TradingAnchorButton,
  Intent,
  CopyWithTooltip,
} from '@vegaprotocol/ui-toolkit';
import {
  type DispatchStrategy,
  type StakingDispatchStrategy,
  TransferStatus,
  type Asset,
} from '@vegaprotocol/types';
import classNames from 'classnames';
import { useT } from '../../lib/use-t';
import { Table } from '../../components/table';
import {
  addDecimalsFormatNumberQuantum,
  formatNumber,
  removePaginationWrapper,
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
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { JoinTeam } from './join-team';
import { UpdateTeamButton } from './update-team-button';
import {
  type TeamGame,
  useGames,
  areTeamGames,
} from '../../lib/hooks/use-games';
import { useEpochInfoQuery } from '../../lib/hooks/__generated__/Epoch';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { type MarketMap, useMarketsMapProvider } from '@vegaprotocol/markets';
import format from 'date-fns/format';
import {
  type EnrichedRewardTransfer,
  isScopedToTeams,
  useRewards,
} from '../../lib/hooks/use-rewards';
import {
  ActiveRewardCard,
  DispatchMetricInfo,
} from '../../components/rewards-container/reward-card';
import { usePartyProfilesQuery } from '../../components/vega-wallet-connect-button/__generated__/PartyProfiles';
import { PreviewRefereeStatistics } from '../referrals/referee-statistics';
import { Trans } from 'react-i18next';
import { Links } from '../../lib/links';
import { useFindReferralSet } from '../referrals/hooks/use-find-referral-set';

const formatDate = (date: Date) => format(date, 'yyyy/MM/dd hh:mm:ss');

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

  const { data: games, loading: gamesLoading } = useGames({ teamId });

  const { data: transfersData, loading: transfersLoading } = useRewards({
    onlyActive: false,
    scopeToTeams: true,
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
      transfersLoading={transfersLoading}
      allMarkets={markets || undefined}
      refetch={refetch}
    />
  );
};

enum Tab {
  Results = 'Results',
  Members = 'Members',
  Benefits = 'Benefits',
}

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
  transfers?: EnrichedRewardTransfer<
    DispatchStrategy | StakingDispatchStrategy
  >[];
  transfersLoading?: boolean;
  allMarkets?: MarketMap;
  refetch: () => void;
}) => {
  const t = useT();
  const [tab, setTab] = useState<Tab>(Tab.Results);

  const createdAt = new Date(team.createdAt);

  const closedIndicator = team.closed ? (
    <div className="border rounded border-vega-clight-300 dark:border-vega-cdark-300 px-1 pt-[1px] flex items-baseline gap-1">
      <VegaIcon name={VegaIconNames.LOCK} size={10} />
      <span>{t('Private')}</span>
    </div>
  ) : (
    <div className="border rounded border-vega-clight-300 dark:border-vega-cdark-300 px-1 pt-[1px] flex items-baseline gap-1">
      <VegaIcon name={VegaIconNames.GLOBE} size={10} />
      <span>{t('Public')}</span>
    </div>
  );

  return (
    <LayoutWithGradient>
      <header className="flex gap-3 lg:gap-4 pt-5 lg:pt-10">
        <TeamAvatar teamId={team.teamId} imgUrl={team.avatarUrl} />
        <div className="flex flex-col items-start gap-1 lg:gap-2">
          <h1
            className="calt text-2xl lg:text-3xl xl:text-5xl"
            data-testid="team-name"
          >
            {team.name}
          </h1>
          <div className="flex gap-2">
            <JoinTeam team={team} partyTeam={partyTeam} refetch={refetch} />
            <UpdateTeamButton team={team} />
            {team.teamUrl && team.teamUrl.length > 0 && (
              <Tooltip description={t("Visit the team's page.")}>
                <span>
                  <TradingAnchorButton
                    intent={Intent.Info}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    href={team.teamUrl}
                  >
                    <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} size={16} />
                  </TradingAnchorButton>
                </span>
              </Tooltip>
            )}
            <CopyWithTooltip
              description={t('Copy this page url.')}
              text={globalThis.location.href}
            >
              <button className="h-10 w-7">
                <VegaIcon name={VegaIconNames.COPY} size={16} />
              </button>
            </CopyWithTooltip>
          </div>
          <div className="flex gap-2 items-baseline text-xs text-muted font-alpha calt">
            {closedIndicator}
            <div className="">
              {t('Created at')}:{' '}
              <span className="text-vega-cdark-600 dark:text-vega-clight-600 ">
                {formatDate(createdAt)}
              </span>{' '}
              ({t('epoch')}: {team.createdAtEpoch})
            </div>
          </div>
        </div>
      </header>
      <TeamStats stats={stats} members={members} games={games} />
      <section>
        <div className="flex gap-4 lg:gap-8 mb-4 border-b border-default">
          <ToggleButton
            active={tab === Tab.Results}
            onClick={() => setTab(Tab.Results)}
            data-testid="games-toggle"
          >
            {t('Results {{games}}', {
              replace: {
                games: gamesLoading ? '' : games ? `(${games.length})` : '(0)',
              },
            })}
          </ToggleButton>
          <ToggleButton
            active={tab === Tab.Members}
            onClick={() => setTab(Tab.Members)}
            data-testid="members-toggle"
          >
            {t('Members ({{count}})', {
              count: members ? members.length : 0,
            })}
          </ToggleButton>
          <ToggleButton
            active={tab === Tab.Benefits}
            onClick={() => setTab(Tab.Benefits)}
            data-testid="benefits-toggle"
          >
            {t('Referral benefits')}
          </ToggleButton>
        </div>
        {tab === Tab.Results && (
          <Games
            games={games}
            gamesLoading={gamesLoading}
            transfers={transfers}
            transfersLoading={transfersLoading}
            allMarkets={allMarkets}
          />
        )}
        {tab === Tab.Members && <Members members={members} />}
        {tab === Tab.Benefits && <Benefits teamId={team.teamId} />}
      </section>
    </LayoutWithGradient>
  );
};

const Benefits = ({ teamId }: { teamId: string }) => {
  const { pubKey } = useVegaWallet();
  const { role } = useFindReferralSet(pubKey);

  if (pubKey && role != null) {
    return (
      <p className="text-muted text-sm">
        Since you are already part of a referral set, you cannot leave it. You
        can trade and play in this team but your referral discounts will be
        based on the original set, and any commission earned will go to your
        original referrer.
      </p>
    );
  }

  return (
    <div>
      <PreviewRefereeStatistics
        setId={teamId}
        withTeamTile={false}
        className="!mb-5"
      />
      <p className="text-sm">
        <Trans
          i18nKey="By joining this team you are joining the above referral set and will enjoy the benefits shown, see <0>Referrals</0> for more details."
          components={[
            <Link
              key="link-to-program-details"
              className="underline"
              to={Links.REFERRALS()}
            >
              Referrals
            </Link>,
          ]}
        />
      </p>
    </div>
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
  transfers?: EnrichedRewardTransfer<
    DispatchStrategy | StakingDispatchStrategy
  >[];
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
    <div className="text-sm">
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

            const rejected =
              t.transfer.status === TransferStatus.STATUS_REJECTED;

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
    </div>
  );
};

const Members = ({ members }: { members?: Member[] }) => {
  const t = useT();

  const partyIds = members?.map((m) => m.referee) || [];
  const { data: profilesData } = usePartyProfilesQuery({
    variables: {
      partyIds,
    },
    skip: partyIds.length === 0,
  });
  const profiles = removePaginationWrapper(
    profilesData?.partiesProfilesConnection?.edges
  );

  if (!members?.length) {
    return <p>{t('No members')}</p>;
  }

  const data = orderBy(
    members.map((m) => ({
      referee: (
        <RefereeLink
          pubkey={m.referee}
          isCreator={m.isCreator}
          profiles={profiles}
        />
      ),
      rewards: formatNumber(m.totalQuantumRewards),
      volume: formatNumber(m.totalQuantumVolume),
      gamesPlayed: formatNumber(m.totalGamesPlayed),
      joinedAt: formatDate(new Date(m.joinedAt)),
      joinedAtEpoch: Number(m.joinedAtEpoch),
    })),
    'joinedAtEpoch',
    'desc'
  );

  return (
    <div className="text-sm">
      <Table
        columns={[
          { name: 'referee', displayName: t('Member') },
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
    </div>
  );
};

const RefereeLink = ({
  pubkey,
  isCreator,
  profiles,
}: {
  pubkey: string;
  isCreator: boolean;
  profiles?: { partyId: string; alias: string }[];
}) => {
  const t = useT();
  const linkCreator = useLinks(DApp.Explorer);
  const link = linkCreator(EXPLORER_PARTIES.replace(':id', pubkey));

  const alias = profiles?.find((p) => p.partyId === pubkey)?.alias;

  return (
    <div className="flex items-baseline gap-2">
      <Link to={link} target="_blank" className="underline underline-offset-4">
        {alias || truncateMiddle(pubkey)}
      </Link>
      {!alias && (
        <Tooltip
          description={t(
            'You can set your pubkey alias by using the key selector in the top right corner.'
          )}
        >
          <button className="text-muted text-xs">
            <VegaIcon name={VegaIconNames.QUESTION_MARK} size={14} />
          </button>
        </Tooltip>
      )}
      {alias && (
        <span className="text-muted text-xs">{truncateMiddle(pubkey)}</span>
      )}
      {isCreator && (
        <span className="text-muted text-xs border border-vega-clight-300 dark:border-vega-cdark-300  rounded px-1 py-[1px]">
          {t('Owner')}
        </span>
      )}
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

const EndTimeCell = ({ epoch }: { epoch?: number }) => {
  const { data, loading } = useEpochInfoQuery({
    variables: {
      epochId: epoch ? epoch.toString() : undefined,
    },
    fetchPolicy: 'cache-first',
  });

  if (loading) return <Loader size="small" />;
  if (data) {
    return formatDate(new Date(data.epoch.timestamps.expiry));
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
  transfer?: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
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
        <DispatchMetricInfo reward={transfer} />
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
  transfer: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
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
