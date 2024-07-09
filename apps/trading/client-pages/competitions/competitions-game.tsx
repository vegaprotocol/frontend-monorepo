import { ErrorBoundary } from '@sentry/react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '../../lib/use-t';
import { ActiveRewardCard } from '../../components/rewards-container/reward-card';
import { useReward } from '../../lib/hooks/use-rewards';
import { useCurrentEpoch } from '../../lib/hooks/use-current-epoch';
import { Loader } from '@vegaprotocol/ui-toolkit';
import { determineRank, useGames } from '../../lib/hooks/use-games';
import { Table } from '../../components/table';
import { type TeamEntityFragment } from '../../lib/hooks/__generated__/Games';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import omit from 'lodash/omit';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { TeamAvatar } from '../../components/competitions/team-avatar';
import { useTeamsMap } from '../../lib/hooks/use-teams';
import { Links } from '../../lib/links';
import { LayoutWithGradient } from '../../components/layouts-inner';
import {
  DispatchMetricLabels,
  DistributionStrategyMapping,
  EntityScopeLabelMapping,
} from '@vegaprotocol/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { useScoresQuery } from './__generated__/Scores';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const CompetitionsGame = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { gameId } = useParams();

  const { data: currentEpoch, loading: currentEpochLoading } =
    useCurrentEpoch();
  const { data: cardData, loading: cardLoading } = useReward(gameId);
  // const { data: assets, loading: assetsLoading } = useAssetsMapProvider();
  const { data: teams, loading: teamsLoading } = useTeamsMap();

  const { data: gamesData, loading: gamesLoading } = useGames({ gameId });

  const { data: scoresData } = useScoresQuery({
    variables: { gameId: gameId || '', partyId: pubKey || '' },
    skip: !gameId,
  });

  const showCard = !(cardLoading || currentEpochLoading) && cardData;
  const showTable = !gamesLoading;

  if (!cardData || !teams || !teams) {
    return null;
  }

  const asset = cardData.dispatchAsset;

  if (!asset) {
    return null;
  }

  const dispatchStrategy = cardData.transfer.kind.dispatchStrategy;
  const dispatchMetric = dispatchStrategy.dispatchMetric;
  const amount = cardData.transfer.amount;
  const entityScope = dispatchStrategy.entityScope;
  const feeCap = dispatchStrategy.capRewardFeeMultiple;
  const strategy = dispatchStrategy.distributionStrategy;
  const notional =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  let scores = compact(scoresData?.gameTeamScores?.edges?.map((e) => e.node));
  scores = orderBy(scores, [(d) => Number(d.score)], ['desc']);
  // @ts-ignore purposefully overwriting the scores variables here
  scores = scores.map((t, i) => {
    const team = teams[t.teamId];
    return {
      rank: i + 1,
      team: {
        name: team.name,
        avatar: team.avatarUrl,
      },
      score: t.score,
    };
  });
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
        <section className="relative flex flex-col gap-4 lg:gap-8 p-6 rounded-lg">
          <div
            style={{
              // @ts-ignore mask not supported
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              // @ts-ignore mask not supported
              'mask-composite': 'exclude',
            }}
            className="absolute inset-0 p-px bg-gradient-to-br from-vega-blue to-vega-green rounded-lg"
          />
          <h2 className="calt">{t('Eligibility criteria')}</h2>
          <dl className="grid grid-cols-2 md:flex gap-4 md:gap-6 lg:gap-8 whitespace-nowrap">
            <div>
              <dd className="text-3xl lg:text-4xl">
                {EntityScopeLabelMapping[entityScope]}
              </dd>
              <dt className="text-sm text-muted">{t('Entity')}</dt>
            </div>
            <div>
              <dd
                className="text-3xl lg:text-4xl"
                data-testid="total-games-stat"
              >
                {dispatchStrategy.stakingRequirement || '0'}
              </dd>
              <dt className="text-sm text-muted">Staked VEGA</dt>
            </div>
            <div>
              <dd className="text-3xl lg:text-4xl">{notional || '0'}</dd>
              <dt className="text-sm text-muted">{t('Notional')}</dt>
            </div>
            <div>
              <dd className="text-3xl lg:text-4xl">
                {DistributionStrategyMapping[strategy]}
              </dd>
              <dt className="text-sm text-muted">{t('Method')}</dt>
            </div>
            {feeCap && (
              <div>
                <dd className="text-3xl lg:text-4xl">{feeCap}x</dd>
                <dt className="text-sm text-muted">{t('Fee cap')}</dt>
              </div>
            )}
            <div>
              <dd className="text-3xl lg:text-4xl">TODO</dd>
              <dt className="text-sm text-muted">{t('Your cap')}</dt>
            </div>
          </dl>
        </section>
        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            {showCard ? (
              <div>
                <ActiveRewardCard
                  transferNode={cardData}
                  currentEpoch={currentEpoch || 0}
                />
              </div>
            ) : (
              <Loader size="small" />
            )}
          </div>

          <div className="md:col-span-2">
            {showTable ? (
              gamesData ? (
                <Table
                  columns={[
                    {
                      name: 'epoch',
                      displayName: t('Epoch'),
                    },
                    { name: 'rank', displayName: t('Rank') },
                    {
                      name: 'teamAvatar',
                      displayName: t('Team avatar'),
                      className: 'md:w-20',
                    },
                    { name: 'teamName', displayName: t('Team name') },
                    { name: 'amount', displayName: t('Rewards earned') },
                  ].map((c) => ({ ...c, headerClassName: 'text-left' }))}
                  data={orderBy(
                    entries,
                    ['epoch', 'rank', 'teamName'],
                    ['desc', 'asc', 'asc']
                  )}
                />
              ) : (
                <div className="text-base text-center">{t('No data')}</div>
              )
            ) : (
              <Loader size="small" />
            )}
          </div>
        </div>*/}
        <section>
          <Tabs defaultValue="scores">
            <TabsList>
              <TabsTrigger value="scores">Live scores</TabsTrigger>
              <TabsTrigger value="history">Score history</TabsTrigger>
            </TabsList>
            <TabsContent value="scores">
              <Table
                columns={[
                  {
                    name: 'rank',
                    displayName: t('Rank'),
                  },
                  {
                    name: 'team',
                    displayName: t('Team'),
                    renderer: (d) => {
                      // TODO: show avatar and name here
                      return 'foo';
                    },
                  },
                  { name: 'score', displayName: t('Live score') },
                ]}
                data={scores}
              />
            </TabsContent>
            <TabsContent value="history">Score history</TabsContent>
          </Tabs>
        </section>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};
