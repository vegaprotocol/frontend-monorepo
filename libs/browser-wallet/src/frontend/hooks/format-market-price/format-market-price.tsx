import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import get from 'lodash/get';

import { useMarketsStore } from '@/stores/markets-store';

export const useFormatMarketPrice = (marketId?: string, price?: string) => {
  const { loading, getMarketById } = useMarketsStore((state) => ({
    loading: state.loading,
    getMarketById: state.getMarketById,
  }));
  if (loading || !marketId || !price) return;
  const market = getMarketById(marketId);
  const marketDecimal = Number(get(market, 'decimalPlaces'));
  if (!market || !marketDecimal)
    throw new Error('Could not find market or decimalPlaces');
  return formatNumber(toBigNum(price, marketDecimal), marketDecimal);
};
