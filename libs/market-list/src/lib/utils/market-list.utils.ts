import type {
  MarketList,
  MarketList_markets,
  MarketList_markets_candles,
} from '../components/__generated__/MarketList';

export const priceChange = (m: MarketList_markets) => {
  if (
    m.candles &&
    m.candles.length > 0 &&
    m.candles[m.candles.length - 1]?.open &&
    m.candles[m.candles.length - 1]?.close
  ) {
    const yesterdayLastPrice = Number(m.candles[0]?.close);
    const recentLastPrice = Number(m.candles[m.candles.length - 1]?.close);
    const increase = recentLastPrice - yesterdayLastPrice;

    return (increase / yesterdayLastPrice) * 100;
  }
  return 0;
};

export const candles = (m: MarketList_markets) =>
  m.candles?.map((c: MarketList_markets_candles | null) => ({
    open: price(c?.open, m.decimalPlaces),
    close: price(c?.close, m.decimalPlaces),
  }));

export const price = (
  value: number | string | null | undefined,
  decimalPlaces: number
) =>
  value === undefined || value === null
    ? 'N/A'
    : Number(value) / Math.pow(10, decimalPlaces);

export const marketCode = (m: MarketList_markets) =>
  m.tradableInstrument.instrument?.code;

export const lastPrice = (m: MarketList_markets) =>
  m.candles
    ? price(
        m.candles && m.candles[m.candles?.length - 1]?.close,
        m.decimalPlaces
      )
    : 'N/A';

export const mapDataToMarketList = (data: MarketList) =>
  data?.markets
    ?.map((m) => ({
      id: m.id,
      marketName: marketCode(m),
      lastPrice: lastPrice(m),
      candles: candles(m),
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
