import type { Market } from '../markets-provider';
import { create } from 'zustand';

type MarketsMap = {
  data: Record<string, Market>;
  update: (markets?: Market[]) => void;
  get: (marketId: string) => Market | undefined;
};

export const useMarketsMap = create<MarketsMap>()((set, get) => ({
  data: {},
  update: (markets) => {
    set({
      data: markets?.reduce(
        (markets, market) => Object.assign(markets, { [market.id]: market }),
        {} as Record<string, Market>
      ),
    });
  },
  get: (marketId: string) => get().data[marketId],
}));
