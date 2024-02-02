import {
  type EstimatePositionQuery,
  type EstimatePositionQueryVariables,
} from '@vegaprotocol/positions';
import { useEstimatePositionQuery } from '@vegaprotocol/positions';
import { useEffect, useState } from 'react';

export const usePositionEstimate = (
  variables: EstimatePositionQueryVariables,
  skip: boolean
) => {
  const [estimates, setEstimates] = useState<EstimatePositionQuery | undefined>(
    undefined
  );
  const { data } = useEstimatePositionQuery({
    variables,
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
