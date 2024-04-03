import orderBy from 'lodash/orderBy';
import { calcTradedFactor, useMarketList } from '@vegaprotocol/markets';
import { isMarketActive } from '../utils';

export const useTopTradedMarkets = () => {
  const { data, loading, error } = useMarketList();

  const activeMarkets = data?.filter(
    (m) => m.data?.marketState && isMarketActive(m.data?.marketState)
  );
  const marketsByTopTraded = data
    ? orderBy(activeMarkets, (m) => calcTradedFactor(m), 'desc')
    : undefined;
  return { data: marketsByTopTraded, loading, error };
};
