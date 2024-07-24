import { useSearchParams } from 'react-router-dom';
import { HeaderPage } from '../../components/header-page';
import {
  type DispatchMetric,
  type EntityScope,
  type DistributionStrategy,
  DispatchMetricLabels,
} from '@vegaprotocol/types';

export const RewardsDetail = () => {
  const [params] = useSearchParams();

  const assetId = params.get('asset');
  const metric = params.get('metric') as DispatchMetric;
  const entityScope = params.get('entityScope') as EntityScope;
  const distributionStrategy = params.get(
    'distributionStrategy'
  ) as DistributionStrategy;
  const stakingRequirement = params.get('stakingRequirement');

  return (
    <>
      <HeaderPage>{DispatchMetricLabels[metric]}</HeaderPage>
      <p>{assetId}</p>
      <p>{metric}</p>
      <p>{entityScope}</p>
      <p>{distributionStrategy}</p>
      <p>{stakingRequirement}</p>
    </>
  );
};
