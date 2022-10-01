import { LocalStorage } from '@vegaprotocol/react-helpers';
import create from 'zustand';

interface GlobalStore {
  connectDialog: boolean;
  networkSwitcherDialog: boolean;
  landingDialog: boolean;
  riskNoticeDialog: boolean;
  marketId: string | null;
  pageTitle: string | null;
  update: (store: Partial<Omit<GlobalStore, 'update'>>) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  connectDialog: false,
  networkSwitcherDialog: false,
  landingDialog: false,
  riskNoticeDialog: false,
  marketId: LocalStorage.getItem('marketId') || null,
  pageTitle: null,
  update: (state) => {
    set(state);
    if (state.marketId) {
      LocalStorage.setItem('marketId', state.marketId);
    }
  },
}));
