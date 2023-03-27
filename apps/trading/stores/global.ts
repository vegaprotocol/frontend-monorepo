import { LocalStorage } from '@vegaprotocol/utils';
import { create } from 'zustand';
import produce from 'immer';

interface GlobalStore {
  nodeSwitcherDialog: boolean;
  marketId: string | null;
  update: (store: Partial<Omit<GlobalStore, 'update'>>) => void;
  shouldDisplayWelcomeDialog: boolean;
  shouldDisplayAnnouncementBanner: boolean;
}

interface PageTitleStore {
  pageTitle: string | null;
  updateTitle: (title: string) => void;
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  nodeSwitcherDialog: false,
  marketId: LocalStorage.getItem('marketId') || null,
  shouldDisplayWelcomeDialog: false,
  shouldDisplayAnnouncementBanner: true,
  update: (newState) => {
    set(
      produce((state: GlobalStore) => {
        Object.assign(state, newState);
      })
    );
    if (newState.marketId) {
      LocalStorage.setItem('marketId', newState.marketId);
    }
  },
}));

export const usePageTitleStore = create<PageTitleStore>((set) => ({
  pageTitle: null,
  updateTitle: (title: string) => set({ pageTitle: title }),
}));
