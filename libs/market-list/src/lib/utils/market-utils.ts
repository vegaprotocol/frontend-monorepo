import { formatNumberPercentage } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type { MarketItemFieldsFragment, MarketCandleFieldsFragment } from '../';

export const totalFees = (fees: Schema.FeeFactors) => {
  if (!fees) {
    return undefined;
  }
  return formatNumberPercentage(
    new BigNumber(fees.makerFee)
      .plus(fees.liquidityFee)
      .plus(fees.infrastructureFee)
      .times(100)
  );
};

export const mapDataToMarketList = (markets: MarketItemFieldsFragment[]) => {
  const tradingModesOrdering = [
    Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_BATCH_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
    Schema.MarketTradingMode.TRADING_MODE_NO_TRADING,
  ];
  const orderedMarkets = orderBy(
    markets?.filter(
      (m) =>
        m.state !== Schema.MarketState.STATE_REJECTED &&
        m.tradingMode !== Schema.MarketTradingMode.TRADING_MODE_NO_TRADING
    ) || [],
    ['marketTimestamps.open', 'id'],
    ['asc', 'asc']
  );
  return orderedMarkets.sort(
    (a, b) =>
      tradingModesOrdering.indexOf(a.tradingMode) -
      tradingModesOrdering.indexOf(b.tradingMode)
  );
};

export const calcCandleLow = (
  candles: MarketCandleFieldsFragment[]
): string | undefined => {
  return candles
    ?.reduce((acc: BigNumber, c) => {
      if (c?.low) {
        if (acc.isLessThan(new BigNumber(c.low))) {
          return acc;
        }
        return new BigNumber(c.low);
      }
      return acc;
    }, new BigNumber(candles?.[0]?.high ?? 0))
    .toString();
};

export const calcCandleHigh = (
  candles: MarketCandleFieldsFragment[]
): string | undefined => {
  return candles
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
