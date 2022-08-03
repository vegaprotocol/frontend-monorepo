import { gql, useQuery } from '@apollo/client';
import { useMemo, useRef } from 'react';
import type {
  MarketMarkPrice,
  MarketMarkPriceVariables,
} from './__generated__/MarketMarkPrice';

const MARKET_MARK_PRICE = gql`
  query MarketMarkPrice($marketId: ID!) {
    market(id: $marketId) {
      decimalPlaces
      data {
        markPrice
      }
    }
  }
`;

export default (marketId: string) => {
  const memoRef = useRef<MarketMarkPrice | null>(null);
  const { data } = useQuery<MarketMarkPrice, MarketMarkPriceVariables>(
    MARKET_MARK_PRICE,
    {
      pollInterval: 5000,
      variables: { marketId },
      skip: !marketId,
    }
  );
  return useMemo(() => {
    if (
      data &&
      data.market?.data?.markPrice !== memoRef.current?.market?.data?.markPrice
    ) {
      memoRef.current = data;
    }
    return memoRef.current;
  }, [data, memoRef]);
};
