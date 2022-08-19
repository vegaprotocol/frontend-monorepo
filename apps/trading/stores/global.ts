import create from 'zustand';
import { LocalStorage } from '@vegaprotocol/react-helpers';

const RISK_ACCEPTED_KEY = 'vega-risk-accepted';

interface GlobalStore {
  vegaWalletConnectDialog: boolean;
  setVegaWalletConnectDialog: (isOpen: boolean) => void;
  vegaWalletManageDialog: boolean;
  setVegaWalletManageDialog: (isOpen: boolean) => void;
  vegaNetworkSwitcherDialog: boolean;
  setVegaNetworkSwitcherDialog: (isOpen: boolean) => void;
  landingDialog: boolean;
  setLandingDialog: (isOpen: boolean) => void;
  vegaRiskNoticeDialog: boolean;
  setVegaRiskNoticeDialog: (isOpen: boolean) => void;
  marketId: string | null;
  setMarketId: (marketId: string) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  vegaWalletConnectDialog: false,
  setVegaWalletConnectDialog: (isOpen: boolean) => {
    set({ vegaWalletConnectDialog: isOpen });
  },
  vegaWalletManageDialog: false,
  setVegaWalletManageDialog: (isOpen: boolean) => {
    set({ vegaWalletManageDialog: isOpen });
  },
  vegaNetworkSwitcherDialog: false,
  setVegaNetworkSwitcherDialog: (isOpen: boolean) => {
    set({ vegaNetworkSwitcherDialog: isOpen });
  },
  landingDialog: false,
  setLandingDialog: (isOpen: boolean) => {
    set({ landingDialog: isOpen });
  },
  vegaRiskNoticeDialog: !LocalStorage.getItem(RISK_ACCEPTED_KEY),
  setVegaRiskNoticeDialog: (isOpen: boolean) => {
    set({ vegaRiskNoticeDialog: isOpen });
    if (!isOpen) {
      // LocalStorage.setItem(RISK_ACCEPTED_KEY, 'true');
    }
  },
  marketId: null,
  setMarketId: (id: string) => {
    set({ marketId: id });
  },
}));
