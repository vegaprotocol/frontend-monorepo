import {
  type EstimatePositionQuery,
  type EstimatePositionQueryVariables,
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
  generalAccountBalance,
  marginAccountBalance,
  orderMarginAccountBalance,
  averageEntryPrice,
  marginMode,
  marginFactor,
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
      generalAccountBalance,
      marginAccountBalance,
      orderMarginAccountBalance,
      averageEntryPrice,
      marginMode,
      marginFactor,
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
