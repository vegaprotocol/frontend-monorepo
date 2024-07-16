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
import { useGames } from '../../lib/hooks/use-games';
import { Table } from '../../components/table';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';
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
  useScoresQuery,
  type TeamScoreFieldsFragment,
} from './__generated__/Scores';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import { TEAMS_STATS_EPOCHS } from '../../lib/hooks/constants';
import { type TeamsFieldsFragment } from '../../lib/hooks/__generated__/Teams';

export const CompetitionsGame = () => {
  const t = useT();
  const { gameId } = useParams();
  const { pubKey } = useVegaWallet();

  const { data: currentEpoch, loading: epochLoading } = useCurrentEpoch();
  const { data: reward, loading: rewardLoading } = useReward(gameId);
  const { data: teams, loading: teamsLoading } = useTeamsMap();

  const { data: liveScoreData, loading: liveScoreLoading } = useScoresQuery({
    variables: {
      epochFrom: currentEpoch,
      epochTo: currentEpoch,
      gameId: gameId || '',
      partyId: pubKey || '',
      pagination: { last: 500 },
    },
    skip: !currentEpoch || !gameId,
  });

  if (epochLoading || rewardLoading || teamsLoading || liveScoreLoading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!reward || !teams || !liveScoreData) {
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

  const liveScores = compact(
    (liveScoreData?.gameTeamScores?.edges || []).map((e) => e.node)
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
          partyScores={liveScoreData.gamePartyScores}
        />
        {gameId && (
          <section>
            <Tabs defaultValue="scores">
              <TabsList>
                <TabsTrigger value="scores">Live scores</TabsTrigger>
                <TabsTrigger value="history">Score history</TabsTrigger>
              </TabsList>
              <TabsContent value="scores">
                <LiveScoresTable
                  scores={liveScores}
                  asset={asset}
                  rewardAmount={amount}
                  rankTable={rankTable}
                  teams={teams}
                  distributionStrategy={dispatchStrategy.distributionStrategy}
                />
              </TabsContent>
              <TabsContent value="history">
                <HistoricScoresTable
                  gameId={gameId}
                  currentEpoch={currentEpoch || 0}
                  teams={teams}
                />
              </TabsContent>
            </Tabs>
          </section>
        )}
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

/**
 * Use latest score data to calculate payouts and render a table of the latest
 * scores by team
 */
const LiveScoresTable = ({
  scores,
  asset,
  distributionStrategy,
  rankTable,
  teams,
  rewardAmount,
}: {
  scores: TeamScoreFieldsFragment[];
  asset: AssetFieldsFragment;
  distributionStrategy: DistributionStrategy;
  rankTable: RankTable[];
  teams: Record<string, TeamsFieldsFragment>;
  rewardAmount: string;
}) => {
  const t = useT();

  const sumOfScores = scores.reduce(
    (sum, s) => sum.plus(s.score),
    BigNumber(0)
  );

  const getPayoutRank = (rank: number, rankTable: RankTable[]) => {
    const nextRankIndex = rankTable.findIndex((r) => {
      return r.startRank > rank;
    });

    const payoutRank =
      nextRankIndex > -1
        ? rankTable[nextRankIndex - 1]
        : rankTable[rankTable.length - 1];

    return payoutRank;
  };

  const orderedScores = orderBy(scores, [(d) => Number(d.score)], ['desc']);

  // Get total of all ratios for each team
  const total = orderedScores
    .map((_, i) => {
      const teamRank = i + 1;
      const payoutRank = getPayoutRank(teamRank, rankTable);
      return payoutRank.shareRatio;
    })
    .reduce((sum, ratio) => sum + ratio, 0);

  const lastEpochScores = orderedScores.map((t, i) => {
    const teamRank = i + 1;
    const team = teams[t.teamId];

    let reward: BigNumber;

    if (
      distributionStrategy === DistributionStrategy.DISTRIBUTION_STRATEGY_RANK
    ) {
      const payoutRank = getPayoutRank(teamRank, rankTable);

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

/**
 * Fetch scores and use game data to display a list of teams and epochs.
 * Game data is used to join on the reward earned for that team during
 * that epoch
 */
const HistoricScoresTable = ({
  gameId,
  currentEpoch,
  teams,
}: {
  gameId: string;
  currentEpoch: number;
  teams: Record<string, TeamsFieldsFragment>;
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const { data: gamesData, loading: gameLoading } = useGames({ gameId });

  const { data: scoreData, loading: scoreLoading } = useScoresQuery({
    variables: {
      epochFrom: currentEpoch ? currentEpoch - TEAMS_STATS_EPOCHS : 0,
      gameId: gameId || '',
      partyId: pubKey || '',
    },
    skip: !currentEpoch || !gameId,
  });

  if (!gamesData && gameLoading) {
    return <p>{t('Loading')}</p>;
  }

  if (!scoreData && scoreLoading) {
    return <p>{t('Loading')}</p>;
  }

  if (!scoreData || !gamesData) {
    return <p>{t('No data')}</p>;
  }

  const scores = compact(
    (scoreData.gameTeamScores?.edges || []).map((e) => e.node)
  );

  const withoutCurrentEpoch = scores.filter((s) => s.epochId !== currentEpoch);
  const scoresByEpoch = orderBy(
    Object.entries(groupBy(withoutCurrentEpoch, 'epochId')),
    (d) => Number(d[0]),
    'desc'
  );
  const scoresByEpochOrdered = scoresByEpoch.map((group) => {
    const results = group[1];

    // sort each result set by score
    const orderedResults = orderBy(results, (d) => Number(d.score), 'desc').map(
      (t, i) => {
        const team = teams[t.teamId];
        // find the game and team for this epoch in order to retreive
        // rewards earned data for that team
        const game = gamesData.find((g) => g.epoch === t.epochId);
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
          epoch: t.epochId,
          score: t.score,
          rewardEarned: formatNumber(rewardEarned, 2),
        };
      }
    );

    return orderedResults;
  });

  const list = flatten(scoresByEpochOrdered);

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
          name: 'rewardEarned',
          displayName: t('Rewards earned'),
        },
      ]}
      data={list}
    />
  );
};
