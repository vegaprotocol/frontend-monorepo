import { create } from 'zustand';
import {
  SidebarAccordion,
  SidebarAccordionContent,
  SidebarAccordionItem,
  SidebarAccordionTrigger,
} from './sidebar-accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from '../error-boundary';
import { NodeHealthContainer } from '../node-health';
import { AssetCard } from '../asset-card';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import { SidebarAccountsContainer } from '../accounts-container/sidebar-accounts-container';
import classNames from 'classnames';

export enum ViewType {
  Trade = 'Trade',
  Info = 'Info',
  Assets = 'Assets',
}

export const Sidebar = ({ pinnedAssets }: { pinnedAssets?: string[] }) => {
  const t = useT();
  const params = useParams();
  const navigate = useNavigate();
  const { view, setView } = useSidebar();

  return (
    <div className="grid grid-rows-[1fr_min-content] p-1 h-full">
      <SidebarAccordion
        type="single"
        value={view}
        onValueChange={(view) => {
          if (!view) {
            setView(ViewType.Trade);
          } else {
            setView(view as ViewType);
          }
        }}
        collapsible
      >
        <SidebarAccordionItem value={ViewType.Trade}>
          <SidebarAccordionTrigger data-testid="Trade">
            {t('Trade')}
          </SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div className="p-2">
              <ErrorBoundary feature="deal-ticket">
                {params.marketId && (
                  <DealTicketContainer
                    marketId={params.marketId}
                    onDeposit={() => navigate(Links.DEPOSIT())}
                  />
                )}
              </ErrorBoundary>
            </div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value={ViewType.Info}>
          <SidebarAccordionTrigger data-testid="Info">
            {t('Market info')}
          </SidebarAccordionTrigger>
          <SidebarAccordionContent>
            <div className="p-2">
              <ErrorBoundary feature="market-info">
                {params.marketId && (
                  <MarketInfoAccordionContainer marketId={params.marketId} />
                )}
              </ErrorBoundary>
            </div>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value={ViewType.Assets}>
          {!pinnedAssets?.length || view === ViewType.Assets ? (
            <SidebarAccordionTrigger data-testid="Assets">
              {t('Assets')}
            </SidebarAccordionTrigger>
          ) : (
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger
                data-testid="Assets"
                className={classNames('grid w-full', {
                  'grid-cols-2': pinnedAssets.length === 2,
                  'grid-cols-1': pinnedAssets.length === 1,
                })}
              >
                {pinnedAssets.map((assetId) => (
                  <AssetCard
                    key={assetId}
                    assetId={assetId}
                    showAllocation={pinnedAssets.length === 1}
                  />
                ))}
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
          )}
          <SidebarAccordionContent>
            <SidebarAccountsContainer pinnedAssets={pinnedAssets} />
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
