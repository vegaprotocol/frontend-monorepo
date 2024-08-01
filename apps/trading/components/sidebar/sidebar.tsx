import {
  SidebarAccordion,
  SidebarAccordionContent,
  SidebarAccordionItem,
  SidebarAccordionHeader,
  SidebarAccordionTrigger,
} from './sidebar-accordion';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { useParams } from 'react-router-dom';

import { ErrorBoundary } from '../error-boundary';
import { AssetCard } from '../asset-card';
import { useT } from '../../lib/use-t';
import { SidebarAccountsContainer } from '../accounts-container/sidebar-accounts-container';
import { TicketContainer } from '../ticket';
import classNames from 'classnames';
import { MarginModeToggle } from '../margin-mode';
import { useSidebar, ViewType } from '../../lib/hooks/use-sidebar';

export const Sidebar = ({ pinnedAssets }: { pinnedAssets?: string[] }) => {
  const t = useT();
  const params = useParams();
  const { view, setView } = useSidebar();

  return (
    <div className="grid grid-rows-[1fr_min-content] h-full">
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
          <SidebarAccordionHeader>
            <SidebarAccordionTrigger data-testid="Trade" className="grow">
              {t('Trade')}
            </SidebarAccordionTrigger>
            <MarginModeToggle />
          </SidebarAccordionHeader>
          <SidebarAccordionContent>
            <ErrorBoundary feature="deal-ticket">
              <TicketContainer />
            </ErrorBoundary>
          </SidebarAccordionContent>
        </SidebarAccordionItem>
        <SidebarAccordionItem value={ViewType.Info}>
          <SidebarAccordionHeader>
            <SidebarAccordionTrigger data-testid="Info">
              {t('Market info')}
            </SidebarAccordionTrigger>
          </SidebarAccordionHeader>
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
            <SidebarAccordionHeader>
              <SidebarAccordionTrigger data-testid="Assets">
                {t('Assets')}
              </SidebarAccordionTrigger>
            </SidebarAccordionHeader>
          ) : (
            <SidebarAccordionHeader>
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
            </SidebarAccordionHeader>
          )}
          <SidebarAccordionContent>
            <SidebarAccountsContainer pinnedAssets={pinnedAssets} />
          </SidebarAccordionContent>
        </SidebarAccordionItem>
      </SidebarAccordion>
      <div className="mt-1 h-5 flex justify-end">
        {/* Element to provide space for the node health */}
      </div>
    </div>
  );
};
