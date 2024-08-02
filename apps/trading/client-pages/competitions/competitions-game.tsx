// @ts-ignore No types available for duration-js
import Duration from 'duration-js';
import { Link, useParams } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

import {
  DispatchMetricLabels,
  type DispatchStrategy,
  DistributionStrategy,
  DistributionStrategyMapping,
  EntityScopeLabelMapping,
  type RankTable,
  DispatchMetric,
} from '@vegaprotocol/types';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import {
  Loader,
  Splash,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumber,
  getDateTimeFormat,
  toBigNum,
} from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';
import { useReward } from '../../lib/hooks/use-rewards';
import { useCurrentEpoch } from '../../lib/hooks/use-current-epoch';
import { useGames } from '../../lib/hooks/use-games';
import { Table } from '../../components/table';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { useTeamsMap } from '../../lib/hooks/use-teams';
import { Links } from '../../lib/links';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import {
  type ScoresQuery,
  useScoresQuery,
  type TeamScoreFieldsFragment,
} from './__generated__/Scores';
import BigNumber from 'bignumber.js';
import { TEAMS_STATS_EPOCHS } from '../../lib/hooks/constants';
import { type TeamsFieldsFragment } from '../../lib/hooks/__generated__/Teams';
import { HeaderPage } from '../../components/header-page';
import { Card } from '../../components/card';
import { ErrorBoundary } from '../../components/error-boundary';
import {
  addMinutes,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from 'date-fns';

type Metric = DispatchMetric | 'STAKING_REWARD_METRIC';

export const CompetitionsGame = () => {
  const t = useT();
  const { gameId } = useParams();
  const { pubKey } = useVegaWallet();

  const { param } = useNetworkParam('rewards_updateFrequency');
  const { data: epoch, loading: epochLoading } = useCurrentEpoch();

  const { data: reward, loading: rewardLoading } = useReward(gameId);
  const { data: teams, loading: teamsLoading } = useTeamsMap();

  const windowLength = reward?.transfer.kind.dispatchStrategy.windowLength;
  const epochFrom =
    epoch.id !== undefined && windowLength !== undefined
      ? epoch.id - windowLength
      : undefined;

  const { data: liveScoreData, loading: liveScoreLoading } = useScoresQuery({
    variables: {
      epochFrom,
      epochTo: epoch.id,
      gameId: gameId || '',
      partyId: pubKey || '',
      pagination: { last: 500 },
    },
    skip: !epoch.id || !gameId,
  });

  if (
    epochLoading ||
    rewardLoading ||
    teamsLoading ||
    liveScoreLoading ||
    !param
  ) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!epoch.id) {
    return null;
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

  const currentScores = liveScores.filter((s) => s.epochId === epoch.id);
  const scoresByEpoch = groupBy(liveScores, (s) => s.epochId);
  const orderedByEpoch = orderBy(
    Object.values(scoresByEpoch),
    (s) => s[0].epochId,
    'desc'
  );
  const latestScores = orderedByEpoch.length ? orderedByEpoch[0] : undefined;
  const latestScore = latestScores?.length ? latestScores[0] : undefined;

  return (
    <ErrorBoundary feature="game">
      <header className="flex flex-col gap-2">
        <HeaderPage>
          {dispatchMetric ? DispatchMetricLabels[dispatchMetric] : t('Unknown')}
        </HeaderPage>
        <p className="text-muted text-4xl">
          {addDecimalsFormatNumberQuantum(
            amount,
            asset.decimals,
            asset.quantum
          )}{' '}
          <span className="calt">{asset.symbol}</span>
        </p>
      </header>
      <EligibilityCriteria
        asset={asset}
        dispatchStrategy={dispatchStrategy as DispatchStrategy}
        partyScores={liveScoreData.gamePartyScores}
      />
      {gameId && (
        <section>
          <Tabs defaultValue="scores">
            <div className="flex justify-between border-b border-default">
              <TabsList>
                <TabsTrigger value="scores">{t('Live scores')}</TabsTrigger>
                <TabsTrigger value="history">{t('Score history')}</TabsTrigger>
              </TabsList>
              <TabsContent value="scores">
                {latestScore && (
                  <UpdateTime
                    lastUpdate={latestScore.time}
                    updateFrequency={param}
                  />
                )}
              </TabsContent>
            </div>
            <TabsContent value="scores">
              {epoch.id < Number(reward.transfer.kind.startEpoch) ? (
                <p>{t('Game not started')}</p>
              ) : (
                <LiveScoresTable
                  currentScores={currentScores}
                  metric={dispatchMetric}
                  asset={asset}
                  rewardAmount={amount}
                  rankTable={rankTable}
                  teams={teams}
                  distributionStrategy={dispatchStrategy.distributionStrategy}
                  epochStart={epoch.timestamps.start}
                  updateFrequency={param}
                />
              )}
            </TabsContent>
            <TabsContent value="history">
              {epoch.id < Number(reward.transfer.kind.startEpoch) ? (
                <p>{t('Game not started')}</p>
              ) : (
                <HistoricScoresTable
                  gameId={gameId}
                  currentEpoch={epoch.id || 0}
                  teams={teams}
                />
              )}
            </TabsContent>
          </Tabs>
        </section>
      )}
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
    <Card variant="cool" size="lg" className="flex flex-col gap-4" minimal>
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
    </Card>
  );
};

/**
 * Use latest score data to calculate payouts and render a table of the latest
 * scores by team
 */
const LiveScoresTable = ({
  currentScores,
  metric,
  asset,
  distributionStrategy,
  rankTable,
  teams,
  rewardAmount,
  epochStart,
  updateFrequency,
}: {
  currentScores: TeamScoreFieldsFragment[];
  metric: Metric;
  asset: AssetFieldsFragment;
  distributionStrategy: DistributionStrategy;
  rankTable: RankTable[];
  teams: Record<string, TeamsFieldsFragment>;
  rewardAmount: string;
  epochStart: Date | undefined;
  updateFrequency: string;
}) => {
  const t = useT();

  const scoreUnit = useScoreUnit(metric, asset);
  const sumOfScores = currentScores.reduce(
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

  const orderedScores = orderBy(
    currentScores,
    [(d) => Number(d.score)],
    ['desc']
  );

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
    // Inside this component the game has already started (epochStart > currentEpoch)
    // so if there are no scores we are waiting for the first update of scores which should
    // arrive after 'rewards.updateFrequency' duration has passed
    if (epochStart) {
      const firstEverUpdate = getNextUpdate(updateFrequency, epochStart);
      return <p>Updates in: {formatDistanceToNow(firstEverUpdate)}</p>;
    }

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
          displayName: t('Live score {{unit}}', {
            unit: scoreUnit ? `(${scoreUnit})` : '',
          }),
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

const UpdateTime = (props: { lastUpdate: string; updateFrequency: string }) => {
  const t = useT();

  const lastUpdate = new Date(props.lastUpdate);
  const nextUpdate = getNextUpdate(props.updateFrequency, lastUpdate);

  return (
    <>
      <p className="text-muted">
        {t('Last updated: {{datetime}}', {
          datetime: getDateTimeFormat().format(lastUpdate),
        })}
      </p>
      <p>Next update: {getDateTimeFormat().format(nextUpdate)}</p>
      <p>
        Next update in{' '}
        <time dateTime={getDateTimeFormat().format(nextUpdate)}>
          {formatDistanceToNowStrict(nextUpdate)}
        </time>
      </p>
    </>
  );
};

const useScoreUnit = (metric: Metric, asset: AssetFieldsFragment) => {
  const t = useT();

  if (metric === DispatchMetric.DISPATCH_METRIC_MAKER_FEES_RECEIVED) {
    return asset.symbol;
  }

  if (metric === DispatchMetric.DISPATCH_METRIC_MAKER_FEES_PAID) {
    return asset.symbol;
  }

  if (metric === DispatchMetric.DISPATCH_METRIC_LP_FEES_RECEIVED) {
    return asset.symbol;
  }

  if (metric === DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION) {
    return t('Contracts');
  }

  if (metric === DispatchMetric.DISPATCH_METRIC_RETURN_VOLATILITY) {
    return 'σ2';
  }

  return null;
};

const getNextUpdate = (updateFrequency: string, lastUpdate: Date) => {
  const d = new Duration(updateFrequency);
  const nextUpdate = addMinutes(lastUpdate, d.minutes());
  return nextUpdate;
};
