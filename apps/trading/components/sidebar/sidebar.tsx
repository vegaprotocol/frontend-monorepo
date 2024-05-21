import { create } from 'zustand';
import {
  SidebarAccordion,
  SidebarAccordionContent,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
} from './sidebar-accordion';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from '../error-boundary';
import { NodeHealthContainer } from '../node-health';
import { AssetCard } from '../asset-card';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';

export enum ViewType {
  Trade = 'Trade',
  Info = 'Info',
  Assets = 'Assets',
}

export const Sidebar = () => {
  const t = useT();
  const params = useParams();
  const navigate = useNavigate();
  const { view, setView } = useSidebar();

  return (
    <div className="grid grid-rows-[1fr_min-content] p-1 h-full">
      <SidebarAccordion
        type="single"
        value={view}
        onValueChange={(x: ViewType) => setView(x)}
      >
        <SidebarAccordionItem value={ViewType.Trade}>
          <SidebarAccordionTrigger>{t('Trade')}</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <ErrorBoundary feature="deal-ticket">
              {params.marketId && (
                <DealTicketContainer
                  marketId={params.marketId}
                  onDeposit={() => navigate(Links.DEPOSIT())}
                />
              )}
            </ErrorBoundary>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value={ViewType.Info}>
          <SidebarAccordionTrigger>{t('Market info')}</SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <ErrorBoundary feature="market-info">
              {params.marketId && (
                <MarketInfoAccordionContainer marketId={params.marketId} />
              )}
            </ErrorBoundary>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value={ViewType.Assets}>
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
  view: ViewType;
  setView: (view: ViewType) => void;
}>()((set) => ({
  view: ViewType.Trade,
  setView: (view) => set({ view }),
}));
