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
