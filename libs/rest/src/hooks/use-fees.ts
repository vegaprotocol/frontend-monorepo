import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  liquidityFeesQueryKeys,
  makerFeesQueryKeys,
  retrieveLiquidityFees,
  retrieveMakerFees,
} from '../queries/fees';
import { Time } from '../utils/datetime';

export function useLiquidityFees(marketId: string, epoch?: string) {
  const client = useQueryClient();
  const queryResult = useQuery({
    queryKey: liquidityFeesQueryKeys.market(marketId, epoch),
    queryFn: () => retrieveLiquidityFees({ marketId, epochSeq: epoch }, client),
    staleTime: Time.MIN,
  });

  return queryResult;
}

export function useMakerFees(marketId: string, epoch?: string) {
  const client = useQueryClient();
  const queryResult = useQuery({
    queryKey: makerFeesQueryKeys.market(marketId, epoch),
    queryFn: () => retrieveMakerFees({ marketId, epochSeq: epoch }, client),
    staleTime: Time.MIN,
  });

  return queryResult;
}
