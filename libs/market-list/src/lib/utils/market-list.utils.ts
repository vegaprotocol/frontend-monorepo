import type {
  MarketList,
  MarketList_markets,
} from '../components/__generated__/MarketList';

export const lastPrice = ({ candles }: MarketList_markets) =>
  candles && candles.length > 0
    ? candles && candles[candles?.length - 1]?.close
    : undefined;

export const mapDataToMarketList = ({ markets }: MarketList) =>
  markets
    ?.map((m) => {
      return {
        id: m.id,
        decimalPlaces: m.decimalPlaces,
        marketName: m.tradableInstrument.instrument?.code,
        lastPrice: lastPrice(m),
        candles: (m.candles || []).filter((c) => c),
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
