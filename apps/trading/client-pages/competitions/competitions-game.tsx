import { ErrorBoundary } from '@sentry/react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '../../lib/use-t';
import { useReward } from '../../lib/hooks/use-rewards';
import { useCurrentEpoch } from '../../lib/hooks/use-current-epoch';
import {
  Loader,
  Splash,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type Game, useGames } from '../../lib/hooks/use-games';
import { Table } from '../../components/table';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { useTeamsMap } from '../../lib/hooks/use-teams';
import { Links } from '../../lib/links';
import { LayoutWithGradient } from '../../components/layouts-inner';
import {
  DispatchMetricLabels,
  type DispatchStrategy,
  DistributionStrategy,
  DistributionStrategyMapping,
  EntityScopeLabelMapping,
  type RankTable,
} from '@vegaprotocol/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import {
  type ScoresQuery,
  type TeamScoreFieldsFragment,
  useScoresQuery,
} from './__generated__/Scores';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import { TEAMS_STATS_EPOCHS } from '../../lib/hooks/constants';
import { type TeamsFieldsFragment } from '../../lib/hooks/__generated__/Teams';

export const CompetitionsGame = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { gameId } = useParams();

  const { data: currentEpoch, loading: epochLoading } = useCurrentEpoch();
  const { data: reward, loading: rewardLoading } = useReward(gameId);
  const { data: teams, loading: teamsLoading } = useTeamsMap();
  const { data: gamesData, loading: gameLoading } = useGames({ gameId });
  const { data: scoresData, loading: scoresLoading } = useScoresQuery({
    variables: {
      epochFrom: currentEpoch ? currentEpoch - TEAMS_STATS_EPOCHS : 0,
      gameId: gameId || '',
      partyId: pubKey || '',
    },
    skip: !currentEpoch || !gameId,
  });

  if (
    epochLoading ||
    rewardLoading ||
    teamsLoading ||
    gameLoading ||
    scoresLoading
  ) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!reward || !teams || !gamesData || !scoresData) {
    return (
      <Splash>
        <p>{t('No data')}</p>
      </Splash>
    );
  }

  const asset = reward.dispatchAsset;

  if (!asset) {
    return null;
  }

  const dispatchStrategy = reward.transfer.kind.dispatchStrategy;

  const dispatchMetric = dispatchStrategy.dispatchMetric;
  const amount = reward.transfer.amount;
  const rankTable = dispatchStrategy.rankTable as unknown as RankTable[];

  if (!rankTable) return null;

  const allScores = compact(
    scoresData?.gameTeamScores?.edges?.map((e) => e.node)
  );

  return (
    <ErrorBoundary>
      <LayoutWithGradient>
        <header>
          <h1
            className="calt text-2xl lg:text-3xl xl:text-5xl"
            data-testid="team-name"
          >
            {dispatchMetric
              ? DispatchMetricLabels[dispatchMetric]
              : t('Unknown')}
          </h1>

          <small className="text-xl lg:text-2xl xl:text-3xl text-muted">
            {addDecimalsFormatNumberQuantum(
              amount,
              asset.decimals,
              asset.quantum
            )}{' '}
            {asset.symbol}
          </small>
        </header>
        <EligibilityCriteria
          asset={asset}
          dispatchStrategy={dispatchStrategy as DispatchStrategy}
          partyScores={scoresData.gamePartyScores}
        />
        <section>
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="scores">Live scores</TabsTrigger>
              <TabsTrigger value="history">Score history</TabsTrigger>
            </TabsList>
            <TabsContent value="scores">
              <LiveScoresTable
                currentEpoch={currentEpoch || 0}
                scores={allScores}
                asset={asset}
                rewardAmount={amount}
                rankTable={rankTable}
                teams={teams}
                distributionStrategy={dispatchStrategy.distributionStrategy}
              />
            </TabsContent>
            <TabsContent value="history">
              <HistoricScoresTable
                currentEpoch={currentEpoch || 0}
                scores={allScores}
                teams={teams}
                games={gamesData || []}
              />
            </TabsContent>
          </Tabs>
        </section>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};

const EligibilityCriteria = ({
  asset,
  dispatchStrategy,
  partyScores,
}: {
  asset: AssetFieldsFragment;
  dispatchStrategy: DispatchStrategy;
  partyScores: ScoresQuery['gamePartyScores'];
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const entityScope = dispatchStrategy.entityScope;
  const feeCap = dispatchStrategy.capRewardFeeMultiple;
  const strategy = dispatchStrategy.distributionStrategy;
  const notional =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  // Calc user fee cap
  const partyScore = partyScores?.edges?.find(
    (e) => e.node?.partyId === pubKey
  );
  const userCap =
    partyScore?.node && feeCap
      ? BigNumber(partyScore.node.totalFeesPaid).times(feeCap)
      : null;

  const labelClasses = 'text-sm text-muted';
  const valueClasses = 'text-2xl lg:text-3xl';

  return (
    <section className="relative flex flex-col gap-2 lg:gap-4 p-6 rounded-lg">
      <div
        style={{
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
        className="absolute inset-0 p-px bg-gradient-to-br from-vega-blue to-vega-green rounded-lg"
      />
      <h2 className="calt">{t('Eligibility criteria')}</h2>
      <dl className="grid grid-cols-2 md:flex gap-2 md:gap-6 lg:gap-8 whitespace-nowrap">
        <div>
          <dd className={valueClasses}>
            {EntityScopeLabelMapping[entityScope]}
          </dd>
          <dt className={labelClasses}>{t('Entity')}</dt>
        </div>
        <div>
          <dd className={valueClasses}>
            {dispatchStrategy.stakingRequirement || '0'}
          </dd>
          <dt className={labelClasses}>{t('Staked VEGA')}</dt>
        </div>
        <div>
          <dd className={valueClasses}>
            {addDecimalsFormatNumber(notional, asset.decimals) || '0'}
          </dd>
          <dt className={labelClasses}>{t('Notional')}</dt>
        </div>
        <div>
          <dd className={valueClasses}>
            {DistributionStrategyMapping[strategy]}
          </dd>
          <dt className={labelClasses}>{t('Method')}</dt>
        </div>
        {feeCap && (
          <>
            <div>
              <dd className="text-3xl lg:text-4xl">{feeCap}x</dd>
              <dt className="text-sm text-muted">{t('Fee cap')}</dt>
            </div>
            <div>
              <dd className="text-3xl lg:text-4xl">
                {userCap ? userCap.toString() : t('No cap')}
              </dd>
              <dt className="text-sm text-muted">
                {t('Your cap')}
                <Tooltip
                  description={t(
                    'Your fees paid for this epoch are currently {{paid}} so your rewards will be capped at {{cap}} times this amount',
                    {
                      paid: partyScore?.node?.totalFeesPaid || '0',
                      cap: feeCap,
                    }
                  )}
                >
                  <VegaIcon name={VegaIconNames.INFO} />
                </Tooltip>
              </dt>
            </div>
          </>
        )}
      </dl>
    </section>
  );
};

const LiveScoresTable = ({
  currentEpoch,
  scores,
  asset,
  distributionStrategy,
  rankTable,
  teams,
  rewardAmount,
}: {
  currentEpoch: number;
  scores: TeamScoreFieldsFragment[];
  asset: AssetFieldsFragment;
  distributionStrategy: DistributionStrategy;
  rankTable: RankTable[];
  teams: Record<string, TeamsFieldsFragment>;
  rewardAmount: string;
}) => {
  const t = useT();
  const _scores = scores.filter((s) => s.epochId === currentEpoch);

  const sumOfScores = _scores.reduce(
    (sum, s) => sum.plus(s.score),
    BigNumber(0)
  );

  // Get total of all ratios for each team
  const total = _scores
    .map((_, i) => {
      const teamRank = i + 1;
      const nextRankIndex = rankTable.findIndex((r) => {
        return r.startRank > teamRank;
      });
      const payoutRank = rankTable[nextRankIndex - 1];
      return payoutRank.shareRatio;
    })
    .reduce((sum, ratio) => sum + ratio, 0);

  const lastEpochScores = orderBy(
    _scores,
    [(d) => Number(d.score)],
    ['desc']
  ).map((t, i) => {
    const teamRank = i + 1;
    const team = teams[t.teamId];

    let reward: BigNumber;

    if (
      distributionStrategy === DistributionStrategy.DISTRIBUTION_STRATEGY_RANK
    ) {
      const nextRankIndex = rankTable.findIndex((r) => {
        return r.startRank > teamRank;
      });
      const payoutRank = rankTable[nextRankIndex - 1];
      reward = toBigNum(rewardAmount, asset.decimals)
        .times(payoutRank.shareRatio)
        .div(total);
    } else {
      reward = toBigNum(rewardAmount, asset.decimals).times(
        BigNumber(t.score).div(sumOfScores)
      );
    }

    return {
      rank: teamRank,
      team: (
        <Link
          to={Links.COMPETITIONS_TEAM(team.teamId)}
          className="flex gap-4 items-center"
        >
          <span>
            <TeamAvatar
              teamId={team.teamId}
              imgUrl={team.avatarUrl}
              size="small"
            />
          </span>
          <span>{team.name}</span>
        </Link>
      ),
      score: formatNumber(t.score, 2),
      estimatedRewards: formatNumber(reward, 2),
    };
  });

  if (!lastEpochScores.length) {
    return <p>No scores for current epoch</p>;
  }

  return (
    <Table
      columns={[
        {
          name: 'rank',
          displayName: t('Rank'),
        },
        {
          name: 'team',
          displayName: t('Team'),
        },
        {
          name: 'score',
          displayName: t('Live score'),
        },
        {
          name: 'estimatedRewards',
          displayName: t('Estimated reward ({{symbol}})', {
            symbol: asset.symbol,
          }),
        },
      ]}
      data={lastEpochScores}
    />
  );
};

const HistoricScoresTable = ({
  currentEpoch,
  scores,
  teams,
  games,
}: {
  currentEpoch: number;
  scores: TeamScoreFieldsFragment[];
  teams: Record<string, TeamsFieldsFragment>;
  games: Game[];
}) => {
  const t = useT();

  const history = scores
    .filter((s) => {
      return s.epochId !== currentEpoch;
    })
    .map((s, i) => {
      const team = teams[s.teamId];
      const game = games.find((g) => g.epoch === s.epochId);
      const entity = game?.entities.find((e) => {
        if (
          e.__typename === 'TeamGameEntity' &&
          e.team.teamId === team.teamId
        ) {
          return true;
        }
        return false;
      });
      const rewardEarned =
        entity?.__typename === 'TeamGameEntity'
          ? entity.rewardEarnedQuantum
          : '0';

      return {
        rank: i + 1,
        team: (
          <Link
            to={Links.COMPETITIONS_TEAM(team.teamId)}
            className="flex gap-4 items-center"
          >
            <span>
              <TeamAvatar
                teamId={team.teamId}
                imgUrl={team.avatarUrl}
                size="small"
              />
            </span>
            <span>{team.name}</span>
          </Link>
        ),
        epoch: s.epochId,
        rewardEarned: formatNumber(rewardEarned, 2),
      };
    });

  if (!history.length) {
    return <p>No history</p>;
  }

  return (
    <Table
      columns={[
        {
          name: 'rank',
          displayName: t('Rank'),
        },
        {
          name: 'team',
          displayName: t('Team'),
        },
        {
          name: 'epoch',
          displayName: t('Epoch'),
        },
        {
          name: 'rewards',
          displayName: t('Rewards earned'),
        },
      ]}
      data={history}
    />
  );
};
