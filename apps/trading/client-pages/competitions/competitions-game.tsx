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
  type StakingDispatchStrategy,
  DispatchMetricDescription,
  EntityScope,
  IndividualScope,
} from '@vegaprotocol/types';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import {
  Button,
  Dialog,
  Intent,
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
  toBigNum,
} from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { t, useT } from '../../lib/use-t';
import {
  type EnrichedRewardTransfer,
  useReward,
} from '../../lib/hooks/use-rewards';
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
import { addMinutes, formatDistanceToNowStrict } from 'date-fns';
import { RankPayoutTable } from '../../components/rewards-container/rank-table';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { Role, useMyTeam } from '../../lib/hooks/use-my-team';
import { CompetitionsActions } from '../../components/competitions/competitions-cta';
import { useState } from 'react';
import { MarketSelector } from '../../components/market-selector';
import { DApp, TOKEN_ASSOCIATE, useLinks } from '@vegaprotocol/environment';

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

  const { lastPayout, nextPayout } = getPayouts(
    epoch.id,
    reward.transfer.kind.startEpoch,
    dispatchStrategy.transferInterval || 1
  );

  // The following code gets the last live scores for a given game. A single game is considered
  // as the time between two payouts. So if a game starts at epoch 1 and has a transfer interval of
  // 3 the 'game' runs between epochs 1 and 3. Even if the recurring transfer has a window length of
  // more than that. After epoch 3 the game resets and runs from epoch 3 until epoch 6.
  //
  // The following code gets all live scores since the last payout and shows the latest one by epoch
  // so we always have the latest scores for the given games start epoch, window length and transfer interval
  const liveScores = compact(
    (liveScoreData?.gameTeamScores?.edges || []).map((e) => e.node)
  );
  const scoresByEpoch = groupBy(liveScores, (s) => s.epochId);
  const orderedByEpoch = orderBy(
    Object.values(scoresByEpoch),
    (s) => s[0].epochId,
    'desc'
  ).filter((s) => {
    if (s[0].epochId >= lastPayout) return true;
    return false;
  });
  const latestScores = orderedByEpoch.length ? orderedByEpoch[0] : [];
  const latestScore = latestScores?.length ? latestScores[0] : undefined;

  // If its a rank table we want to show an extra tab showing the payout structure
  const isRankPayout = Boolean(dispatchStrategy.rankTable);

  return (
    <ErrorBoundary feature="game">
      <header className="flex flex-col gap-2">
        <HeaderPage>
          {dispatchMetric ? DispatchMetricLabels[dispatchMetric] : t('Unknown')}
        </HeaderPage>
        <p className="text-surface-1-fg-muted text-4xl">
          {addDecimalsFormatNumberQuantum(
            amount,
            asset.decimals,
            asset.quantum
          )}{' '}
          <span className="calt">{asset.symbol}</span>
        </p>
        <TradeToPlayButton reward={reward} />
        <p>{DispatchMetricDescription[dispatchMetric]}</p>
      </header>
      <section className="flex flex-col lg:flex-row gap-4">
        <EntryConditions
          asset={asset}
          dispatchStrategy={dispatchStrategy as DispatchStrategy}
        />
        <GameDetails
          dispatchStrategy={dispatchStrategy as DispatchStrategy}
          partyScores={liveScoreData.gamePartyScores}
          asset={asset}
          nextPayout={nextPayout}
        />
      </section>
      {gameId && (
        <section>
          <Tabs defaultValue="scores">
            <div className="flex justify-between items-center border-b border-gs-300 dark:border-gs-700">
              <TabsList>
                <TabsTrigger value="scores">{t('Live scores')}</TabsTrigger>
                <TabsTrigger value="history">{t('Score history')}</TabsTrigger>
                {isRankPayout && (
                  <TabsTrigger value="payout-structure">
                    {t('Payout structure')}
                  </TabsTrigger>
                )}
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
                  currentScores={latestScores}
                  metric={dispatchMetric}
                  asset={asset}
                  rewardAmount={amount}
                  rankTable={rankTable}
                  teams={teams}
                  distributionStrategy={dispatchStrategy.distributionStrategy}
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
                  lastPayoutEpoch={lastPayout}
                />
              )}
            </TabsContent>
            {isRankPayout && (
              <TabsContent value="payout-structure">
                <PayoutStructure dispatchStrategy={dispatchStrategy} />
              </TabsContent>
            )}
          </Tabs>
        </section>
      )}
    </ErrorBoundary>
  );
};

const EntryConditions = ({
  asset,
  dispatchStrategy,
}: {
  asset: AssetFieldsFragment;
  dispatchStrategy: DispatchStrategy;
}) => {
  const t = useT();

  const entityScope = dispatchStrategy.entityScope;
  const notional =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  const labelClasses = 'text-sm text-surface-1-fg-muted';
  const valueClasses = 'text-2xl lg:text-3xl';

  return (
    <Card
      variant="cool"
      size="lg"
      className="flex-1 flex flex-col gap-4"
      minimal
    >
      <h2 className="calt">{t('Entry conditions')}</h2>
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
      </dl>
    </Card>
  );
};

const GameDetails = ({
  dispatchStrategy,
  partyScores,
  asset,
  nextPayout,
}: {
  dispatchStrategy: DispatchStrategy;
  partyScores: ScoresQuery['gamePartyScores'];
  asset: AssetFieldsFragment;
  nextPayout: number;
}) => {
  const t = useT();
  const { pubKey } = useVegaWallet();

  const scoreUnit = useScoreUnit(dispatchStrategy.dispatchMetric, asset);

  const feeCap = dispatchStrategy.capRewardFeeMultiple;
  const strategy = dispatchStrategy.distributionStrategy;

  // Calc user fee cap
  const partyScore = partyScores?.edges?.find(
    (e) => e.node?.partyId === pubKey
  );
  const userCap =
    partyScore?.node && feeCap
      ? BigNumber(partyScore.node.totalFeesPaid)
          .times(asset.quantum)
          .times(feeCap)
      : null;

  const labelClasses = 'text-sm text-surface-1-fg-muted';
  const valueClasses = 'text-2xl lg:text-3xl';

  return (
    <Card
      variant="cool"
      size="lg"
      className="flex-1 flex flex-col gap-4"
      minimal
    >
      <h2 className="calt">{t('Game details')}</h2>
      <dl className="grid grid-cols-2 md:flex gap-2 md:gap-6 lg:gap-8 whitespace-nowrap">
        <div>
          <dd className={valueClasses}>
            {DistributionStrategyMapping[strategy]}
          </dd>
          <dt className={labelClasses}>{t('Method')}</dt>
        </div>
        <div>
          <dd className={valueClasses}>{nextPayout}</dd>
          <dt className={labelClasses}>{t('Next payout at')}</dt>
        </div>
        {feeCap && (
          <>
            <div>
              <dd className={valueClasses}>{feeCap}x</dd>
              <dt className={labelClasses}>{t('Fee cap')}</dt>
            </div>
            <div>
              <dd className={valueClasses}>
                {userCap ? userCap.toString() : '0'}
              </dd>
              <dt className={labelClasses}>
                <span className="flex gap-1 items-center">
                  <span>{t('Your cap')}</span>
                  <Tooltip
                    description={
                      userCap
                        ? t(
                            'Your fees paid for this epoch are currently {{paid}} so your rewards will be capped at {{cap}} times this amount',
                            {
                              paid: partyScore?.node?.totalFeesPaid || '0',
                              cap: feeCap,
                            }
                          )
                        : t(
                            'Your fees paid for this epoch are currently 0 so you cannot earn rewards.'
                          )
                    }
                  >
                    <span className="inline-block">
                      <VegaIcon name={VegaIconNames.INFO} />
                    </span>
                  </Tooltip>
                </span>
              </dt>
            </div>
          </>
        )}
        <div>
          <dd className={valueClasses}>{scoreUnit}</dd>
          <dt className={labelClasses}>{t('Scored in')}</dt>
        </div>
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
}: {
  currentScores: TeamScoreFieldsFragment[];
  metric: Metric;
  asset: AssetFieldsFragment;
  distributionStrategy: DistributionStrategy;
  rankTable: RankTable[];
  teams: Record<string, TeamsFieldsFragment>;
  rewardAmount: string;
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
    return <p>{t('No data')}</p>;
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
  lastPayoutEpoch,
}: {
  gameId: string;
  currentEpoch: number;
  teams: Record<string, TeamsFieldsFragment>;
  lastPayoutEpoch: number;
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

  // Get all scores that occurred outside of the current payout window
  const withoutCurrentPayoutWindow = scores.filter((s) => {
    if (s.epochId < lastPayoutEpoch) return true;
    return false;
  });
  const scoresByEpoch = orderBy(
    Object.entries(groupBy(withoutCurrentPayoutWindow, 'epochId')),
    (d) => Number(d[0]),
    'desc'
  );

  // Enrich the scores with the actual reward earned value from
  // the games API
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
    <p>
      {t('Next update in {{time}}', {
        time: formatDistanceToNowStrict(nextUpdate),
      })}
    </p>
  );
};

const PayoutStructure = (props: {
  dispatchStrategy: DispatchStrategy | StakingDispatchStrategy;
}) => {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p>
          {props.dispatchStrategy.rankTable &&
            t(
              'Payout percentages are base estimates assuming no individual reward multipliers are active. If users in teams have active multipliers, the reward amounts may vary.'
            )}
        </p>
      </div>
      {props.dispatchStrategy.rankTable && (
        <RankPayoutTable rankTable={props.dispatchStrategy.rankTable} />
      )}
    </div>
  );
};

/**
 * Returns a score unit based on the transfes dispatch metric
 */
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
    return (
      <>
        {'σ'}
        <sup>2</sup>
      </>
    );
  }

  return null;
};

/**
 * Calculate when the next live score update is expected given the last
 * known update time and the updateFrequency network param.
 */
const getNextUpdate = (updateFrequency: string, lastUpdate: Date) => {
  const d = new Duration(updateFrequency);
  const nextUpdate = addMinutes(lastUpdate, d.minutes());
  return nextUpdate;
};

/**
 * Some maths to calculate the last and next payout epoch
 * given the start epoch and transferInterval
 */
export const getPayouts = (
  currentEpoch: number,
  startEpoch: number,
  interval: number
) => {
  const passedIntervals = (currentEpoch - startEpoch) / interval;
  const lastPayout = startEpoch + passedIntervals * interval;
  const nextPayout = startEpoch + (passedIntervals + 1) * interval;

  return {
    lastPayout,
    nextPayout,
  };
};

const TradeToPlayButton = ({
  reward,
}: {
  reward: EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>;
}) => {
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  const governanceLink = useLinks(DApp.Governance);

  const { pubKey } = useVegaWallet();
  const { stakeAvailable } = useStakeAvailable(pubKey);
  const { team: myTeam, teamId: myTeamId, role: myRole } = useMyTeam();

  const entityScope = reward.transfer.kind.dispatchStrategy.entityScope;
  const individualScope = reward.transfer.kind.dispatchStrategy.individualScope;
  const teamScope = reward.transfer.kind.dispatchStrategy.teamScope;

  const currentStake = toBigNum(String(stakeAvailable || 0), 18);
  const requiredStake = toBigNum(
    reward.transfer.kind.dispatchStrategy.stakingRequirement || 0,
    18
  );

  const openSignUpDialog = () => {
    setSignUpOpen(true);
  };

  const openMarketSelectorDialog = () => {
    setTradeOpen(true);
  };

  let disabled = false;
  let needsStake = false;
  let needsSignUp = false;

  if (entityScope === EntityScope.ENTITY_SCOPE_TEAMS) {
    if (!myTeamId) {
      needsSignUp = true;
    }
    if (myTeamId) {
      const scopedToTeam = teamScope && teamScope.length > 0;
      if (scopedToTeam) {
        if (!teamScope.includes(myTeamId) && myRole === Role.TEAM_MEMBER) {
          needsSignUp = true;
        }
        if (!teamScope.includes(myTeamId) && myRole === Role.TEAM_OWNER) {
          disabled = true;
        }
      }
    }
  }

  if (entityScope === EntityScope.ENTITY_SCOPE_INDIVIDUALS) {
    if (
      individualScope === IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM &&
      !myTeam
    ) {
      needsSignUp = true;
    }
    if (
      individualScope === IndividualScope.INDIVIDUAL_SCOPE_NOT_IN_TEAM &&
      myTeamId
    ) {
      disabled = true;
    }
  }

  needsStake = currentStake.isLessThan(requiredStake);

  let props = {
    intent: Intent.Primary,
    children: t('COMPETITION_GAME_TRADE_TO_PLAY_BUTTON_DEFAULT_LABEL'),
    onClick: openMarketSelectorDialog,
    disabled,
  };

  if (needsSignUp) {
    props = {
      ...props,
      children: t('COMPETITION_GAME_TRADE_TO_PLAY_BUTTON_SIGN_UP_LABEL'),
      onClick: openSignUpDialog,
    };
  } else if (needsStake) {
    props = {
      ...props,
      children: t('COMPETITION_GAME_TRADE_TO_PLAY_BUTTON_STAKE_LABEL'),
      onClick: () => undefined, // link to associate page
    };
  }

  return (
    <>
      <p>
        {needsStake ? (
          <a
            href={governanceLink(TOKEN_ASSOCIATE)}
            target="_blank"
            rel="noreferrer"
          >
            <Button {...props} />
          </a>
        ) : (
          <Button {...props} />
        )}
      </p>

      <Dialog
        size="large"
        open={signUpOpen}
        onChange={(open) => {
          setSignUpOpen(open);
        }}
        title={t('COMPETITION_GAME_TRADE_TO_PLAY_DIALOG_SIGN_UP_TITLE')}
      >
        <CompetitionsActions myRole={myRole} myTeamId={myTeamId} />
      </Dialog>

      <Dialog
        size="large"
        open={tradeOpen}
        onChange={(open) => {
          setTradeOpen(open);
        }}
        title={t('COMPETITION_GAME_TRADE_TO_PLAY_DIALOG_DEFAULT_TITLE')}
      >
        <MarketSelector
          onSelect={() => {
            setTradeOpen(false);
          }}
          showFilters={false}
          marketIdsInScope={reward.markets?.map((m) => m.id)}
        />
      </Dialog>
    </>
  );
};
