import orderBy from 'lodash/orderBy';
import type {
  MarketList,
  MarketList_markets,
} from '../components/markets-container/__generated__/MarketList';

export const lastPrice = ({ candles }: MarketList_markets) =>
  candles && candles.length > 0
    ? candles && candles[candles?.length - 1]?.close
    : undefined;

export const mapDataToMarketList = ({ markets }: MarketList) =>
  orderBy(
    markets?.map((m) => {
      return {
        id: m.id,
        decimalPlaces: m.decimalPlaces,
        marketName: m.tradableInstrument.instrument?.code,
        lastPrice: lastPrice(m) ?? m.data?.markPrice,
        candles: (m.candles || []).filter((c) => c),
        open: m.marketTimestamps.open
          ? new Date(m.marketTimestamps.open).getTime()
          : null,
        close: m.marketTimestamps.close
          ? new Date(m.marketTimestamps.close).getTime()
          : null,
        state: m.state,
      };
    }) || [],
    ['state', 'open', 'id'],
    ['asc', 'asc', 'asc']
  );
