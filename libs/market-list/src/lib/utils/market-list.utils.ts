import type {
  MarketList,
  MarketList_markets,
  MarketList_markets_candles,
} from '../components/__generated__/MarketList';

export const priceChangePercentage = ({ candles }: MarketList_markets) => {
  if (candles && candles.length > 0) {
    const yesterdayLastPrice = Number(candles[0]?.close);
    const recentLastPrice = Number(candles[candles.length - 1]?.close);
    const increase = recentLastPrice - yesterdayLastPrice;

    return (increase / yesterdayLastPrice) * 100;
  }
  return 0;
};

export const priceChange = ({ candles, decimalPlaces }: MarketList_markets) => {
  if (candles && candles.length > 0) {
    const yesterdayLastPrice = price(candles[0]?.close, decimalPlaces);
    const recentLastPrice = price(
      candles[candles.length - 1]?.close,
      decimalPlaces
    );
    if (recentLastPrice !== 'N/A' && yesterdayLastPrice !== 'N/A') {
      return recentLastPrice - yesterdayLastPrice;
    }
    return 0;
  }
  return 0;
};

export const candles = ({ candles, decimalPlaces }: MarketList_markets) =>
  candles?.map((c: MarketList_markets_candles | null) => ({
    open: price(c?.open, decimalPlaces),
    close: price(c?.close, decimalPlaces),
  }));

export const price = (
  value: number | string | null | undefined,
  decimalPlaces: number
) =>
  value === undefined || value === null
    ? 'N/A'
    : Number(value) / Math.pow(10, decimalPlaces);

export const marketCode = ({ tradableInstrument }: MarketList_markets) =>
  tradableInstrument.instrument?.code;

export const lastPrice = ({ candles, decimalPlaces }: MarketList_markets) =>
  candles && candles.length > 0
    ? price(candles && candles[candles?.length - 1]?.close, decimalPlaces)
    : 'N/A';

export const mapDataToMarketList = ({ markets }: MarketList) =>
  markets
    ?.map((m) => ({
      id: m.id,
      marketName: marketCode(m),
      lastPrice: lastPrice(m),
      candles: candles(m),
      changePercentage: priceChangePercentage(m),
      change: priceChange(m),
      open: m.marketTimestamps.open ? new Date(m.marketTimestamps.open) : null,
      close: m.marketTimestamps.close
        ? new Date(m.marketTimestamps.close)
        : null,
    }))
    .sort((a, b) => {
      const diff = (b.open?.getTime() || 0) - (a.open?.getTime() || 0);
      if (diff !== 0) {
        return diff;
      }
      return b.id === a.id ? 0 : b.id > a.id ? 1 : -1;
    });
