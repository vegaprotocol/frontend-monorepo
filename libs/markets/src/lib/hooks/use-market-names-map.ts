import type { Market } from '../markets-provider';
import { create } from 'zustand';

type MarketNamesMap = {
  data: Record<string, string>;
  update: (markets?: Market[]) => void;
};

export const useMarketNamesMap = create<MarketNamesMap>()((set, get) => ({
  data: {},
  update: (markets) => {
    set({
      data: markets?.reduce(
        (markets, market) =>
          Object.assign(markets, {
            [market.id]: market.tradableInstrument.instrument.code,
          }),
        {} as Record<string, string>
      ),
    });
  },
}));
