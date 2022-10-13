import { LocalStorage } from '@vegaprotocol/react-helpers';
import create from 'zustand';

interface GlobalStore {
  networkSwitcherDialog: boolean;
  landingDialog: boolean;
  riskNoticeDialog: boolean;
  marketId: string | null;
  update: (store: Partial<Omit<GlobalStore, 'update'>>) => void;
  updateMarketId: (marketId: string) => void;
}

interface PageTitleStore {
  pageTitle: string | null;
  updateTitle: (title: string) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  networkSwitcherDialog: false,
  landingDialog: false,
  riskNoticeDialog: false,
  marketId: LocalStorage.getItem('marketId') || null,
  update: (state) => {
    set(state);
    if (state.marketId) {
      LocalStorage.setItem('marketId', state.marketId);
    }
  },
  updateMarketId: (marketId: string) => {
    set({ marketId });
    LocalStorage.setItem('marketId', marketId);
  },
}));

export const usePageTitleStore = create<PageTitleStore>((set) => ({
  pageTitle: null,
  updateTitle: (title: string) => set({ pageTitle: title }),
}));
