import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useShowCurrentMarketOnly = () =>
  useShowCurrentMarketOnlyStore((state) => state.showCurrentMarketOnly);

export const useShowCurrentMarketOnlyStore = create<{
  showCurrentMarketOnly: boolean;
  toggleShowCurrentMarketOnly: () => void;
}>()(
  persist(
    (set) => ({
      showCurrentMarketOnly: false,
      toggleShowCurrentMarketOnly: () => {
        set((curr) => {
          return {
            showCurrentMarketOnly: !curr.showCurrentMarketOnly,
          };
        });
      },
    }),
    {
      name: 'vega_show_current_market_store',
    }
  )
);
