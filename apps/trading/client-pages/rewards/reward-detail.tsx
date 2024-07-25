import { useSearchParams } from 'react-router-dom';
import { HeaderPage } from '../../components/header-page';
import {
  type DispatchMetric,
  type EntityScope,
  type DistributionStrategy,
  DispatchMetricLabels,
} from '@vegaprotocol/types';
import {
  determineCardGroup,
  useRewardsGrouped,
} from '../../lib/hooks/use-rewards';
import { toBigNum } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

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
  const { data } = useRewardsGrouped({ onlyActive: true });
  const key = determineCardGroup(props);

  if (!data) return null;

  const group = data[key];

  if (!group.length) {
    return <p>No rewards found in group</p>;
  }

  const first = group[0];

  const amounts = group.map((g) => {
    if (!g.transfer.asset) return BigNumber(0);
    return toBigNum(g.transfer.amount, g.transfer.asset.decimals);
  });
  const total = BigNumber.sum.apply(null, amounts);

  return (
    <>
      <header>
        <HeaderPage>
          {
            DispatchMetricLabels[
              first.transfer.kind.dispatchStrategy.dispatchMetric
            ]
          }
        </HeaderPage>
        <p className="text-muted text-4xl">{total.toString()}</p>
      </header>
    </>
  );
};
