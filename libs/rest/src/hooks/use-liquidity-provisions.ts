import { useQuery } from '@tanstack/react-query';
import {
  queryKeys,
  retrieveLiquidityProviders,
  retrieveLiquidityProvisions,
} from '../queries/liquidity';
import { Time } from '../utils/datetime';

export function useLiquidityProvisions(marketId: string) {
  const queryResult = useQuery({
    queryKey: queryKeys.market(marketId),
    queryFn: () => retrieveLiquidityProvisions(undefined, { marketId }),
    staleTime: Time.DAY,
  });

  return queryResult;
}

export function useLiquidityProviders(marketId: string) {
  const queryResult = useQuery({
    queryKey: queryKeys.providers(marketId),
    queryFn: () => retrieveLiquidityProviders(undefined, { marketId }),
    staleTime: Time.DAY,
  });

  return queryResult;
}
