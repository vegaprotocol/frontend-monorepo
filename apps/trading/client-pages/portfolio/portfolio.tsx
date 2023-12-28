import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import { titlefy } from '@vegaprotocol/utils';
import { useIncompleteWithdrawals } from '@vegaprotocol/withdraws';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import { usePageTitleStore } from '../../stores';
import {
  AccountsContainer,
  AccountsSettings,
} from '../../components/accounts-container';
import { DepositsContainer } from '../../components/deposits-container';
import {
  FillsContainer,
  FillsSettings,
} from '../../components/fills-container';
import {
  FundingPaymentsContainer,
  FundingPaymentsSettings,
} from '../../components/funding-payments-container';
import {
  PositionsContainer,
  PositionsSettings,
} from '../../components/positions-container';
import { PositionsMenu } from '../../components/positions-menu';
import { WithdrawalsContainer } from '../../components/withdrawals-container';
import {
  OrdersContainer,
  OrdersSettings,
} from '../../components/orders-container';
import { LedgerContainer } from '../../components/ledger-container';
import {
  ResizableGrid,
  ResizableGridPanel,
  usePaneLayout,
} from '../../components/resizable-grid';
import { ViewType, useSidebar } from '../../components/sidebar';
import { AccountsMenu } from '../../components/accounts-menu';
import { DepositsMenu } from '../../components/deposits-menu';
import { WithdrawalsMenu } from '../../components/withdrawals-menu';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';

const WithdrawalsIndicator = () => {
  const { ready } = useIncompleteWithdrawals();
  if (!ready || ready.length === 0) {
    return null;
  }
  return (
    <span className="p-1 leading-none rounded bg-vega-clight-500 dark:bg-vega-cdark-500 text-default">
      {ready.length}
    </span>
  );
};

const SidebarViewInitializer = () => {
  const currentRouteId = useGetCurrentRouteId();
  const { getView, setViews } = useSidebar();
  const view = getView(currentRouteId);
  // Make transfer sidebar open by default
  useEffect(() => {
    if (view === undefined) {
      setViews({ type: ViewType.Transfer }, currentRouteId);
    }
  }, [view, setViews, currentRouteId]);
  return null;
};

export const Portfolio = () => {
  const t = useT();

  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Portfolio')]));
  }, [updateTitle, t]);

  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const wrapperClasses = 'p-0.5 h-full max-h-full flex flex-col';
  return (
    <div className={wrapperClasses}>
      <SidebarViewInitializer />
      <ResizableGrid vertical onChange={handleOnLayoutChange}>
        <ResizableGridPanel minSize={75}>
          <PortfolioGridChild>
            <Tabs storageKey="console-portfolio-top-1">
              <Tab
                id="positions"
                name={t('Positions')}
                menu={<PositionsMenu />}
                settings={<PositionsSettings />}
              >
                <ErrorBoundary feature="portfolio-positions">
                  <PositionsContainer allKeys />
                </ErrorBoundary>
              </Tab>
              <Tab id="orders" name={t('Orders')} settings={<OrdersSettings />}>
                <ErrorBoundary feature="portfolio-orders">
                  <OrdersContainer />
                </ErrorBoundary>
              </Tab>
              <Tab id="fills" name={t('Fills')} settings={<FillsSettings />}>
                <ErrorBoundary feature="portfolio-fills">
                  <FillsContainer />
                </ErrorBoundary>
              </Tab>
              <Tab
                id="funding-payments"
                name={t('Funding payments')}
                settings={<FundingPaymentsSettings />}
              >
                <ErrorBoundary feature="portfolio-funding-payments">
                  <FundingPaymentsContainer />
                </ErrorBoundary>
              </Tab>
              <Tab id="ledger-entries" name={t('Ledger entries')}>
                <ErrorBoundary feature="portfolio-ledger">
                  <LedgerContainer />
                </ErrorBoundary>
              </Tab>
            </Tabs>
          </PortfolioGridChild>
        </ResizableGridPanel>
        <ResizableGridPanel
          priority={LayoutPriority.Low}
          preferredSize={sizes[1] || 300}
          minSize={50}
        >
          <PortfolioGridChild>
            <Tabs storageKey="console-portfolio-bottom">
              <Tab
                id="collateral"
                name={t('Collateral')}
                settings={<AccountsSettings />}
                menu={<AccountsMenu />}
              >
                <ErrorBoundary feature="portfolio-accounts">
                  <AccountsContainer />
                </ErrorBoundary>
              </Tab>
              <Tab id="deposits" name={t('Deposits')} menu={<DepositsMenu />}>
                <ErrorBoundary feature="portfolio-deposit">
                  <DepositsContainer />
                </ErrorBoundary>
              </Tab>
              <Tab
                id="withdrawals"
                name={t('Withdrawals')}
                indicator={<WithdrawalsIndicator />}
                menu={<WithdrawalsMenu />}
              >
                <ErrorBoundary feature="portfolio-deposit">
                  <WithdrawalsContainer />
                </ErrorBoundary>
              </Tab>
            </Tabs>
          </PortfolioGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    </div>
  );
};

interface PortfolioGridChildProps {
  children: ReactNode;
}

const PortfolioGridChild = ({ children }: PortfolioGridChildProps) => {
  return (
    <section className="h-full p-1">
      <div className="h-full border rounded-sm border-default">{children}</div>
    </section>
  );
};
