import { create } from 'zustand';

export enum ViewType {
  Trade = 'Trade',
  Info = 'Info',
  Assets = 'Assets',
}

/** Controls the main trading sidebar view */
export const useSidebar = create<{
  view: ViewType;
  setView: (view: ViewType) => void;
}>()((set) => ({
  view: ViewType.Trade,
  setView: (view) => set({ view }),
}));

export enum SidebarAccountsViewType {
  Deposit = 'Deposit',
  CrossChainDeposit = 'Cross-chain deposit',
  Swap = 'Swap',
  Transfer = 'Transfer',
  Withdraw = 'Withdraw',
}

export type InnerView = [view: SidebarAccountsViewType, assetId: string];

type SidebarAccountsInnerViewStore = {
  view: InnerView | undefined;
  setView: (view: InnerView | undefined) => void;
};

/** Controls the sidebar accounts view */
export const useSidebarAccountsInnerView =
  create<SidebarAccountsInnerViewStore>()((set) => ({
    view: undefined,
    setView: (view) => set({ view }),
  }));

/**
 * Returns a minimum width for the sidebar, if the squid widget
 * is shown its increased to allow room for full display
 */
export const useSquidSidebarMinWidth = () => {
  const sidebar = useSidebar((store) => store.view);
  const sidebarInner = useSidebarAccountsInnerView((store) => store.view);
  const isSquidShowing =
    sidebar === ViewType.Assets &&
    sidebarInner &&
    sidebarInner[0] === SidebarAccountsViewType.CrossChainDeposit;

  return isSquidShowing ? 460 : 350;
};
