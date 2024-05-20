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
import { AssetCard } from '../asset-card';

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

export type SidebarView = 'trade' | 'info' | 'assets';

export const Sidebar = () => {
  const params = useParams();
  const { view, setView } = useSidebar();
  return (
    <div className="grid grid-rows-[1fr_min-content] p-1 h-full">
      <SidebarAccordion
        type="single"
        value={view}
        onValueChange={(x: SidebarView) => setView(x)}
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
          <SidebarAccordionTrigger>
            <AssetCard marketId={params.marketId} />
          </SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div>Asset list</div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
      </SidebarAccordion>
      <div className="py-1 flex justify-end">
        <NodeHealthContainer />
      </div>
    </div>
  );
};

export const useSidebar = create<{
  view: SidebarView;
  setView: (view: SidebarView) => void;
}>()((set) => ({
  view: 'trade',
  setView: (view) => set({ view }),
}));
