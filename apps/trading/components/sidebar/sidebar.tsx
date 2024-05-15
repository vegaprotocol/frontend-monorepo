import { create } from 'zustand';
import {
  SidebarAccordion,
  SidebarAccordionContent,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
} from './sidebar-accordion';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from '../error-boundary';
import { NodeHealthContainer } from '../node-health';

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
  const params = useParams();
  return (
    <div className="grid grid-rows-[1fr_min-content] p-1 h-full">
      <SidebarAccordion
        type="single"
        defaultValue="trade"
        className="h-full min-h-0"
      >
        <SidebarAccordionItem value="trade">
          <SidebarAccordionTrigger>Trade</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <ErrorBoundary feature="deal-ticket">
              {params.marketId ? (
                <DealTicketContainer
                  marketId={params.marketId}
                  onDeposit={() => alert('TODO: handle on deposit')}
                />
              ) : (
                <div>No market Id</div>
              )}
            </ErrorBoundary>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value="info">
          <SidebarAccordionTrigger>Market info</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <ErrorBoundary feature="market-info">
              {params.marketId ? (
                <MarketInfoAccordionContainer marketId={params.marketId} />
              ) : (
                <div>No market Id</div>
              )}
            </ErrorBoundary>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value="assets">
          <SidebarAccordionTrigger>Assets</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div>Assets content</div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
      </SidebarAccordion>
      <div className="py-1 flex justify-end">
        <NodeHealthContainer />
      </div>
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
