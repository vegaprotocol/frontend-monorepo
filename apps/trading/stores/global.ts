import { LocalStorage } from '@vegaprotocol/utils';
import { create } from 'zustand';
import produce from 'immer';

interface GlobalStore {
  marketId: string | null;
  onBoardingDismissed: boolean;
  eagerConnecting: boolean;
  update: (store: Partial<Omit<GlobalStore, 'update'>>) => void;
}

interface PageTitleStore {
  pageTitle: string | null;
  updateTitle: (title: string) => void;
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  marketId: LocalStorage.getItem('marketId') || null,
  onBoardingDismissed: false,
  eagerConnecting: false,
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
