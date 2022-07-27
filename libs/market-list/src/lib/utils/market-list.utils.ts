import { formatNumberPercentage, toBigNum } from '@vegaprotocol/react-helpers';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import type {
  MarketList,
  MarketList_markets,
  MarketList_markets_fees_factors,
} from '../__generated__/MarketList';

export const lastPrice = ({ candles }: MarketList_markets) =>
  candles && candles.length > 0
    ? candles && candles[candles?.length - 1]?.close
    : undefined;

export const totalFees = (fees: MarketList_markets_fees_factors) => {
  return formatNumberPercentage(
    new BigNumber(fees.makerFee)
      .plus(fees.liquidityFee)
      .plus(fees.makerFee)
      .times(100)
  );
};

export const mapDataToMarketList = ({ markets }: MarketList) =>
  orderBy(
    markets
      ?.filter(
        (m) =>
          m.state !== MarketState.Rejected &&
          m.tradingMode !== MarketTradingMode.NoTrading
      )
      .map((m) => {
        return {
          ...m,
          marketName: m.tradableInstrument.instrument?.code,
          settlementAsset:
            m.tradableInstrument.instrument.product?.settlementAsset?.symbol,
          lastPrice: lastPrice(m) ?? m.data?.markPrice,
          candles: (m.candles || []).filter((c) => c),
          candleHigh: m.candles
            ?.reduce(
              (acc: BigNumber, c) =>
                acc.plus(toBigNum(c?.high ?? 0, m.decimalPlaces)),
              new BigNumber(0)
            )
            .toString(),
          candleLow: m.candles
            ?.reduce(
              (acc: BigNumber, c) =>
                acc.plus(toBigNum(c?.low ?? 0, m.decimalPlaces)),
              new BigNumber(0)
            )
            .toString(),
          open: m.marketTimestamps.open
            ? new Date(m.marketTimestamps.open).getTime()
            : null,
          close: m.marketTimestamps.close
            ? new Date(m.marketTimestamps.close).getTime()
            : null,
          totalFees: totalFees(m.fees.factors),
        };
      }) || [],
    ['state', 'open', 'id'],
    ['asc', 'asc', 'asc']
  );
