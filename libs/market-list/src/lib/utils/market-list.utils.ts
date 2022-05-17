import type {
  MarketList,
  MarketList_markets,
  MarketList_markets_candles,
} from '../__generated__/MarketList';

export const priceChange = (m: MarketList_markets) =>
  m.candles &&
  m.candles.length > 0 &&
  m.candles[m.candles.length - 1]?.open &&
  m.candles[m.candles.length - 1]?.close &&
  Number(m.candles[0]?.close) - Number(m.candles[m.candles.length - 1]?.open);

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
  (m.candles &&
    price(
      m.candles && m.candles[m.candles?.length - 1]?.close,
      m.decimalPlaces
    )) ||
  price(m.data?.markPrice, m.decimalPlaces);

export const mapDataToMarketList = (data: MarketList) =>
  data?.markets?.map((m) => ({
    market: marketCode(m),
    lastPrice: lastPrice(m),
    candles: candles(m),
    change: priceChange(m),
  }));
