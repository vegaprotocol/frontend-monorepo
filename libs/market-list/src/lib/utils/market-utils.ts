import { formatNumberPercentage } from '@vegaprotocol/react-helpers';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type {
  MarketListQuery,
  MarketListItemFragment,
} from '../__generated__/MarketData';

export const totalFees = (fees: MarketListItemFragment['fees']['factors']) => {
  if (!fees) {
    return undefined;
  }
  return formatNumberPercentage(
    new BigNumber(fees.makerFee)
      .plus(fees.liquidityFee)
      .plus(fees.makerFee)
      .times(100)
  );
};

export const mapDataToMarketList = ({ markets }: MarketListQuery) => {
  const tradingModesOrdering = [
    MarketTradingMode.TRADING_MODE_CONTINUOUS,
    MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    MarketTradingMode.TRADING_MODE_NO_TRADING,
  ];
  const orderedMarkets = orderBy(
    markets
      ?.filter(
        (m) =>
          m.state !== MarketState.STATE_REJECTED &&
          m.tradingMode !== MarketTradingMode.TRADING_MODE_NO_TRADING
      )
      .map((m) => {
        return {
          ...m,
          open: m.marketTimestamps.open
            ? new Date(m.marketTimestamps.open).getTime()
            : null,
          close: m.marketTimestamps.close
            ? new Date(m.marketTimestamps.close).getTime()
            : null,
        };
      }) || [],
    ['open', 'id'],
    ['asc', 'asc']
  );
  return orderedMarkets.sort(
    (a, b) =>
      tradingModesOrdering.indexOf(a.tradingMode) -
      tradingModesOrdering.indexOf(b.tradingMode)
  );
};

export const calcCandleLow = (m: MarketListItemFragment): string | undefined => {
  return m.candles
    ?.reduce((acc: BigNumber, c) => {
      if (c?.low) {
        if (acc.isLessThan(new BigNumber(c.low))) {
          return acc;
        }
        return new BigNumber(c.low);
      }
      return acc;
    }, new BigNumber(m.candles?.[0]?.high ?? 0))
    .toString();
};

export const calcCandleHigh = (m: MarketListItemFragment): string | undefined => {
  return m.candles
    ?.reduce((acc: BigNumber, c) => {
      if (c?.high) {
        if (acc.isGreaterThan(new BigNumber(c.high))) {
          return acc;
        }
        return new BigNumber(c.high);
      }
      return acc;
    }, new BigNumber(0))
    .toString();
};
