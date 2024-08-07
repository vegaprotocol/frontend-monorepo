import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import get from 'lodash/get';

import { HALF_MAX_POSITION_SIZE } from '@/lib/transactions';
import { useMarketsStore } from '@/stores/markets-store';

export const useFormatSizeAmount = (marketId?: string, size?: string) => {
  const { loading, getMarketById } = useMarketsStore((state) => ({
    loading: state.loading,
    getMarketById: state.getMarketById,
  }));
  if (loading || !marketId || !size) return;
  if (size === HALF_MAX_POSITION_SIZE) return 'Max';
  const market = getMarketById(marketId);
  const positionDecimals = Number(get(market, 'positionDecimalPlaces'));
  const noPositionDecimals = !positionDecimals && positionDecimals !== 0;

  if (!market || noPositionDecimals)
    throw new Error('Could not find market or positionDecimals');
  return formatNumber(toBigNum(size, positionDecimals), positionDecimals);
};
