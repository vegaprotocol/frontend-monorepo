import { create } from 'zustand';
import {
  SidebarAccordion,
  SidebarAccordionContent,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
} from './sidebar-accordion';

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
  return (
    <div className="p-1 h-full">
      <SidebarAccordion type="single" defaultValue="trade" className="h-full">
        <SidebarAccordionItem value="trade">
          <SidebarAccordionTrigger>Trade</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div>Trade content</div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value="info">
          <SidebarAccordionTrigger>Market info</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div>Market info content</div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value="assets">
          <SidebarAccordionTrigger>Assets</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div>Assets content</div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
      </SidebarAccordion>
    </div>
  );
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
