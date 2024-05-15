import { create } from 'zustand';

// TODO: Delete this and all references to it
export enum ViewType {
  Order = 'Order',
  Info = 'Info',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  Settings = 'Settings',
  ViewAs = 'ViewAs',
  Close = 'Close',
  Swap = 'Swap',
}

// TODO: Delete this and all references to it
export type BarView =
  | {
    type: ViewType.Deposit;
    assetId?: string;
  }
  | {
    type: ViewType.Withdraw;
    assetId?: string;
  }
  | {
    type: ViewType.Transfer;
    assetId?: string;
  }
  | {
    type: ViewType.Swap;
  }
  | {
    type: ViewType.Order;
  }
  | {
    type: ViewType.Info;
  }
  | {
    type: ViewType.Settings;
  }
  | {
    type: ViewType.Close;
  };

export const Sidebar = () => {
  return <div>Sidebar</div>;
};

// TODO: Delete this and ensure all usage of this hook instead navigate to new pages
export const useSidebar = create<{
  views: { [key: string]: BarView | null };
  setViews: (view: BarView | null, routeId: string) => void;
  getView: (routeId: string) => BarView | null | undefined;
}>()((set, get) => ({
  views: {},
  setViews: (x, routeId) =>
    set(({ views }) => ({ views: { ...views, [routeId]: x } })),
  getView: (routeId) => get().views[routeId],
}));
