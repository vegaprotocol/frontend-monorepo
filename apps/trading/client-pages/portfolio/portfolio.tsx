import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import { useIncompleteWithdrawals } from '@vegaprotocol/withdraws';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
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
import { usePageTitle } from '../../lib/hooks/use-page-title';

import { DepositContainer } from '@vegaprotocol/deposits';
import { TransferContainer } from '@vegaprotocol/accounts';
import { WithdrawContainer } from '../../components/withdraw-container';

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
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);

  usePageTitle(t('Portfolio'));

  return largeScreen ? <PortfolioGrid /> : <PortfolioSmall />;
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

const PortfolioGrid = () => {
  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const [sizesHorizontal, handleOnHorizontalChange] = usePaneLayout({
    id: 'portfolio-horizontal',
  });
  return (
    <div className="p-0.5 h-full max-h-full flex flex-col">
      <SidebarViewInitializer />
      <ResizableGrid onChange={handleOnHorizontalChange}>
        <ResizableGridPanel
          minSize={340}
          preferredSize={sizesHorizontal[0] || 460}
        >
          <PortfolioGridChild>
            <PortfolioActionTabs />
          </PortfolioGridChild>
        </ResizableGridPanel>
        <ResizableGridPanel>
          <ResizableGrid vertical onChange={handleOnLayoutChange}>
            <ResizableGridPanel minSize={75}>
              <PortfolioGridChild>
                <PortfolioTopTabs />
              </PortfolioGridChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              priority={LayoutPriority.Low}
              preferredSize={sizes[1] || 300}
              minSize={50}
            >
              <PortfolioGridChild>
                <PortfolioBottomTabs />
              </PortfolioGridChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
      </ResizableGrid>
    </div>
  );
};

const PortfolioSmall = () => {
  return (
    <div className="overflow-y-auto h-full">
      <div>
        <PortfolioActionTabs />
      </div>
      <div className="h-[300px] border-t border-default">
        <PortfolioTopTabs />
      </div>
      <div className="h-[300px] border-t border-default">
        <PortfolioBottomTabs />
      </div>
    </div>
  );
};

const PortfolioActionTabs = () => {
  const t = useT();
  return (
    <Tabs storageKey="portfolio-sidebar">
      <Tab id="deposit" name={t('Deposit')}>
        <ErrorBoundary feature="portfolio-deposit">
          <div className="p-2">
            <p className="text-sm mb-4">
              {t('Deposit from your Ethereum wallet')}
            </p>
            <DepositContainer />
          </div>
        </ErrorBoundary>
      </Tab>
      <Tab id="withdraw" name={t('Withdraw')}>
        <ErrorBoundary feature="portfolio-withdraw">
          <div className="p-2">
            <WithdrawContainer />
          </div>
        </ErrorBoundary>
      </Tab>
      <Tab id="transfer" name={t('Transfer')}>
        <ErrorBoundary feature="portfolio-transfer">
          <div className="p-2">
            <TransferContainer />
          </div>
        </ErrorBoundary>
      </Tab>
    </Tabs>
  );
};

const PortfolioTopTabs = () => {
  const t = useT();

  return (
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
      <Tab id="fills" name={t('Trades')} settings={<FillsSettings />}>
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
  );
};

const PortfolioBottomTabs = () => {
  const t = useT();
  return (
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
  );
};
