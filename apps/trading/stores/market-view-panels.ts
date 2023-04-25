import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const STORAGE_KEY = 'vega_market_panels_store';

export const useMarketViewPanels = create<{
  topone: string;
  setTop: (top: string) => void;
  verticals: (string | number)[];
  setVertical: (verticals: (string | number)[]) => void;
  bottomPanes: string[];
  setBottom: (bottom: string[]) => void;
}>()(
  persist(
    immer((set) => ({
      topone: '25%',
      setTop: (value) =>
        set((state) => {
          state.topone = value;
          return state;
        }),
      verticals: ['50%', 330, 430],
      setVertical: (verticals: (string | number)[]) =>
        set((state) => {
          state.verticals = verticals;
          return state;
        }),
      bottomPanes: ['50%', '50%'],
      setBottom: (bottomPanes: string[]) =>
        set((state) => {
          state.bottomPanes = bottomPanes;
          return state;
        }),
    })),
    { name: STORAGE_KEY }
  )
);
