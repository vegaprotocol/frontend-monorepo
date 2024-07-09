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

export const CompetitionsGame = () => {
  const t = useT();
  const { gameId } = useParams();

  const { data: currentEpoch, loading: currentEpochLoading } =
    useCurrentEpoch();
  const { data: cardData, loading: cardLoading } = useReward(gameId);
  const { data: assets, loading: assetsLoading } = useAssetsMapProvider();
  const { data: teams, loading: teamsLoading } = useTeamsMap();

  const { data: gamesData, loading: gamesLoading } = useGames({ gameId });

  const dependable = (value: string | JSX.Element | null) => {
    if (assetsLoading || teamsLoading) return <Loader size="small" />;
    return value;
  };

  const entries = flatten(
    compact(
      gamesData?.map((d) => {
        const teamEntities = d.entities.filter(
          (ent) => ent.__typename === 'TeamGameEntity' && ent.team
        ) as TeamEntityFragment[];

        const entities = teamEntities.map((ent) => ({
          ...omit(ent, '__typename', 'rank', 'team'),
          rank: determineRank(teamEntities, ent),
          team: ent.team.teamId,
        }));

        if (!entities || entities.length === 0) return undefined;

        return {
          ...omit(d, '__typename', 'entities', 'team', 'rewardAssetId'),
          asset: assets?.[d.rewardAssetId],
          entities,
        };
      }) || []
    ).map((ep) => {
      return ep.entities.map((ent) => ({
        epoch: ep.epoch,
        rank: ent.rank,
        amount: dependable(
          ep.asset
            ? addDecimalsFormatNumberQuantum(
                ent.rewardEarned,
                ep.asset.decimals,
                ep.asset.quantum
              )
            : '-'
        ),
        volume: ent.volume,
        teamAvatar: dependable(
          teams[ent.team] ? (
            <Link to={Links.COMPETITIONS_TEAM(ent.team)}>
              <TeamAvatar
                teamId={ent.team}
                imgUrl={teams[ent.team].avatarUrl}
                size="small"
              />
            </Link>
          ) : null
        ),
        teamName: dependable(
          teams[ent.team] ? (
            <Link
              to={Links.COMPETITIONS_TEAM(ent.team)}
              className="hover:underline"
            >
              {teams[ent.team].name}
            </Link>
          ) : null
        ),
      }));
    })
  );

  const showCard = !(cardLoading || currentEpochLoading) && cardData;
  const showTable = !gamesLoading;

  if (!cardData) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
        </div>
      </LayoutWithGradient>
    </ErrorBoundary>
  );
};
