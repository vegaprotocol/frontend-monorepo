import compact from 'lodash/compact';
import BigNumber from 'bignumber.js';
import { Link, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import {
  type DispatchMetric,
  type EntityScope,
  type DistributionStrategy,
  DispatchMetricLabels,
  EntityScopeLabelMapping,
  DistributionStrategyMapping,
} from '@vegaprotocol/types';
import { useNetworkParam } from '@vegaprotocol/network-parameters';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { Loader, Splash, Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  formatNumber,
  toBigNum,
} from '@vegaprotocol/utils';

import { NotFoundSplash } from '../../components/not-found-splash';
import { HeaderPage } from '../../components/header-page';
import { Card } from '../../components/card';
import { Table } from '../../components/table';

import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import {
  determineCardGroup,
  useRewardsGrouped,
} from '../../lib/hooks/use-rewards';

export const RewardsDetail = () => {
  const [params] = useSearchParams();

  const assetId = params.get('asset') as string;
  const metric = params.get('metric') as DispatchMetric;
  const entityScope = params.get('entityScope') as EntityScope;
  const distributionStrategy = params.get(
    'distributionStrategy'
  ) as DistributionStrategy;
  const stakingRequirement = params.get('stakingRequirement') as string;

  return (
    <RewardContainer
      assetId={assetId}
      metric={metric}
      entityScope={entityScope}
      distributionStrategy={distributionStrategy}
      stakingRequirement={stakingRequirement}
    />
  );
};

export const RewardContainer = (props: {
  assetId: string;
  metric: DispatchMetric;
  entityScope: EntityScope;
  distributionStrategy: DistributionStrategy;
  stakingRequirement: string;
}) => {
  const t = useT();
  const { param, loading: paramLoading } = useNetworkParam('reward_asset');
  const { data: assets, loading: assetsLoading } = useAssetsMapProvider();

  const { data, loading: rewardsLoading } = useRewardsGrouped({
    onlyActive: true,
  });
  const key = determineCardGroup(props);

  if (paramLoading || assetsLoading || rewardsLoading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  if (!param || !data || !assets) return null;

  const rewardAsset = assets[param];
  const group = data[key];

  if (!group?.length) {
    return <NotFoundSplash />;
  }

  const first = group[0];

  const amounts = group.map((g) => {
    if (!g.transfer.asset) return BigNumber(0);
    return toBigNum(g.transfer.amount, g.transfer.asset.decimals);
  });
  const total = BigNumber.sum.apply(null, amounts);

  const labelClasses = 'text-sm text-muted';
  const valueClasses = 'text-2xl lg:text-3xl';

  const asset = first.transfer.asset;
  const dispatchStrategy = first.transfer.kind.dispatchStrategy;
  const entityScope = dispatchStrategy.entityScope;
  const strategy = dispatchStrategy.distributionStrategy;
  const notional =
    dispatchStrategy.notionalTimeWeightedAveragePositionRequirement;

  if (!asset) return null;

  const tableData = compact(
    group.map((g) => {
      if (!g.transfer.asset) return;
      const dispatchStrategy = g.transfer.kind.dispatchStrategy;

      let rewardsPaid = '-';
      if (dispatchStrategy.transferInterval) {
        if (dispatchStrategy.transferInterval > 1) {
          rewardsPaid = t('daysCount', {
            count: dispatchStrategy.transferInterval,
          });
        } else {
          rewardsPaid = t('Daily');
        }
      }

      return {
        asset: g.transfer.asset?.symbol,
        market: <MarketsCell markets={g.markets} />,
        startEpoch: g.transfer.kind.startEpoch,
        endEpoch: g.transfer.kind.endEpoch,
        lockPeriod: dispatchStrategy.lockPeriod,
        rewardsPaid,
        rewardAmount: formatNumber(
          toBigNum(g.transfer.amount, g.transfer.asset.decimals)
        ),
        rewardCap: dispatchStrategy.capRewardFeeMultiple || '-',
      };
    })
  );

  return (
    <>
      <header className="flex flex-col gap-2">
        <HeaderPage>
          {
            DispatchMetricLabels[
              first.transfer.kind.dispatchStrategy.dispatchMetric
            ]
          }
        </HeaderPage>
        <p className="text-muted text-4xl">
          {formatNumber(total)} <span className="calt">{asset.symbol}</span>
        </p>
      </header>
      <section className="py-6">
        <Card
          minimal={true}
          size="lg"
          variant="cool"
          className="flex flex-col gap-4"
        >
          <h2>{t('Eligibility criteria')}</h2>
          <dl className="grid grid-cols-2 md:flex gap-2 md:gap-6 lg:gap-8 whitespace-nowrap">
            <div>
              <dd className={classNames(valueClasses, 'calt')}>
                {EntityScopeLabelMapping[entityScope]}
              </dd>
              <dt className={labelClasses}>{t('Entity')}</dt>
            </div>
            <div>
              <dd className={valueClasses}>
                {addDecimalsFormatNumber(
                  dispatchStrategy.stakingRequirement || '0',
                  rewardAsset.decimals
                )}
              </dd>
              <dt className={labelClasses}>{t('Staked VEGA')}</dt>
            </div>
            <div>
              <dd className={valueClasses}>{formatNumber(notional || 0, 2)}</dd>
              <dt className={labelClasses}>{t('Notional')}</dt>
            </div>
            <div>
              <dd className={classNames(valueClasses, 'calt')}>
                {DistributionStrategyMapping[strategy]}
              </dd>
              <dt className={labelClasses}>{t('Method')}</dt>
            </div>
          </dl>
        </Card>
      </section>
      <section>
        <Table
          columns={[
            {
              name: 'asset',
              displayName: 'Settlement asset',
            },
            {
              name: 'market',
              displayName: 'Market',
            },
            {
              name: 'startEpoch',
              displayName: 'Start epoch',
            },

            {
              name: 'endEpoch',
              displayName: 'End epoch',
            },
            {
              name: 'rewardsPaid',
              displayName: 'Rewards paid',
            },
            {
              name: 'lockPeriod',
              displayName: 'Lock period',
            },
            {
              name: 'rewardAmount',
              displayName: 'Reward amount',
            },

            {
              name: 'rewardCap',
              displayName: 'Reward cap',
            },
          ]}
          data={tableData}
        />
      </section>
    </>
  );
};

const MarketsCell = (props: { markets?: MarketFieldsFragment[] }) => {
  const t = useT();

  if (!props.markets) {
    return <span>{t('All')}</span>;
  }

  if (props.markets.length > 1) {
    return (
      <Tooltip
        description={
          <ul className="flex flex-col gap-1.5 text-sm">
            {props.markets.map((m) => {
              return (
                <span key={m.id}>
                  {m.tradableInstrument.instrument.code}
                  <Link to={Links.MARKET(m.id)} className="underline">
                    {t('View')}
                  </Link>
                </span>
              );
            })}
          </ul>
        }
        underline
      >
        <span>{t('marketsCount', { count: props.markets.length })}</span>
      </Tooltip>
    );
  }

  const market = props.markets[0];

  return (
    <Link to={Links.MARKET(market.id)} className="underline underline-offset-4">
      {market.tradableInstrument.instrument.code}
    </Link>
  );
};
