import type {
  EstimatePositionQueryVariables,
  EstimatePositionQuery,
} from '@vegaprotocol/positions';
import { useEstimatePositionQuery } from '@vegaprotocol/positions';
import { useEffect, useState } from 'react';

interface PositionEstimateProps extends EstimatePositionQueryVariables {
  skip: boolean;
}

export const usePositionEstimate = ({
  marketId,
  openVolume,
  orders,
  collateralAvailable,
  skip,
}: PositionEstimateProps) => {
  const [estimates, setEstimates] = useState<EstimatePositionQuery | undefined>(
    undefined
  );
  const { data } = useEstimatePositionQuery({
    variables: {
      marketId,
      openVolume,
      orders,
      collateralAvailable,
    },
    skip,
    fetchPolicy: 'no-cache',
  });
  useEffect(() => {
    if (skip) {
      setEstimates(undefined);
    } else if (data) {
      setEstimates(data);
    }
  }, [data, skip]);
  return estimates;
};
