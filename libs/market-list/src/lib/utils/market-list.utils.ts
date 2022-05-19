import BigNumber from 'bignumber.js';
import type {
  MarketList,
  MarketList_markets,
  MarketList_markets_candles,
} from '../components/__generated__/MarketList';

export const priceChangePercentage = (m: MarketList_markets): BigNumber => {
  const change = priceChange(m);
  const { candles } = m;
  if (change && candles && candles.length > 0) {
    const yesterdayLastPrice = price(candles[0]?.close, m.decimalPlaces);
    return change.dividedBy(yesterdayLastPrice).multipliedBy(100);
  }
  return new BigNumber(0);
};

export const priceChange = ({
  candles,
  decimalPlaces,
}: MarketList_markets): BigNumber => {
  if (candles && candles.length > 0) {
    const yesterdayLastPrice = price(candles[0]?.close, decimalPlaces);
    const recentLastPrice = price(
      candles[candles.length - 1]?.close,
      decimalPlaces
    );
    if (recentLastPrice !== 'N/A' && yesterdayLastPrice !== 'N/A') {
      return recentLastPrice.minus(yesterdayLastPrice);
    }
    return new BigNumber(0);
  }
  return new BigNumber(0);
};

export const candles = ({ candles, decimalPlaces }: MarketList_markets) =>
  candles?.map((c: MarketList_markets_candles | null) => ({
    open: price(c?.open, decimalPlaces),
    close: price(c?.close, decimalPlaces),
  }));

export const price = (
  value: number | string | null | undefined,
  decimalPlaces: number
): BigNumber | 'N/A' =>
  value === undefined || value === null
    ? 'N/A'
    : new BigNumber(value).dividedBy(Math.pow(10, decimalPlaces));

export const marketCode = ({ tradableInstrument }: MarketList_markets) =>
  tradableInstrument.instrument?.code;

export const lastPrice = ({ candles, decimalPlaces }: MarketList_markets) =>
  candles && candles.length > 0
    ? price(candles && candles[candles?.length - 1]?.close, decimalPlaces)
    : 'N/A';

export const mapDataToMarketList = ({ markets }: MarketList) =>
  markets
    ?.map((m) => {
      return {
        id: m.id,
        marketName: marketCode(m),
        lastPrice: lastPrice(m),
        candles: candles(m),
        changePercentage: priceChangePercentage(m).toNumber(),
        change: priceChange(m).toNumber(),
        open: m.marketTimestamps.open
          ? new Date(m.marketTimestamps.open)
          : null,
        close: m.marketTimestamps.close
          ? new Date(m.marketTimestamps.close)
          : null,
      };
    })
    .sort((a, b) => {
      const diff = (a.open?.getTime() || 0) - (b.open?.getTime() || 0);
      if (diff !== 0) {
        return diff;
      }
      return a.id === b.id ? 0 : a.id > b.id ? 1 : -1;
    });
