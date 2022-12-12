import { LocalStorage } from '@vegaprotocol/react-helpers';
import create from 'zustand';

interface GlobalStore {
  networkSwitcherDialog: boolean;
  landingDialog: boolean;
  marketId: string | null;
  welcomeNoticeDialog: boolean;
  update: (store: Partial<Omit<GlobalStore, 'update'>>) => void;
}

interface PageTitleStore {
  pageTitle: string | null;
  updateTitle: (title: string) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  networkSwitcherDialog: false,
  landingDialog: false,
  marketId: LocalStorage.getItem('marketId') || null,
  welcomeNoticeDialog: false,
  update: (state) => {
    set(state);
    if (state.marketId) {
      LocalStorage.setItem('marketId', state.marketId);
    }
  },
}));

export const usePageTitleStore = create<PageTitleStore>((set) => ({
  pageTitle: null,
  updateTitle: (title: string) => set({ pageTitle: title }),
}));
