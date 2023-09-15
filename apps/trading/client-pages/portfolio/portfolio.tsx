import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import { titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useIncompleteWithdrawals } from '@vegaprotocol/withdraws';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import { usePageTitleStore } from '../../stores';
import { AccountsContainer } from '../../components/accounts-container';
import { DepositsContainer } from '../../components/deposits-container';
import { FillsContainer } from '../../components/fills-container';
import { PositionsContainer } from '../../components/positions-container';
import { WithdrawalsContainer } from '../../components/withdrawals-container';
import { OrdersContainer } from '../../components/orders-container';
import { LedgerContainer } from '../../components/ledger-container';
import { AccountHistoryContainer } from './account-history-container';
import {
  ResizableGrid,
  ResizableGridPanel,
  usePaneLayout,
} from '../../components/resizable-grid';
import { ViewType, useSidebar } from '../../components/sidebar';
import { AccountsMenu } from '../../components/accounts-menu';
import { DepositsMenu } from '../../components/deposits-menu';
import { WithdrawalsMenu } from '../../components/withdrawals-menu';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-path-id';

const WithdrawalsIndicator = () => {
  const { ready } = useIncompleteWithdrawals();
  if (!ready || ready.length === 0) {
    return null;
  }
  return (
    <span className="bg-vega-clight-500 dark:bg-vega-cdark-500 text-default rounded p-1 leading-none">
      {ready.length}
    </span>
  );
};

export const Portfolio = () => {
  const currentRouteId = useGetCurrentRouteId();
  const { getView, setViews } = useSidebar();
  const view = getView(currentRouteId);

  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Portfolio')]));
  }, [updateTitle]);

  // Make transfer sidebar open by default
  useEffect(() => {
    if (view === undefined) {
      setViews({ type: ViewType.Transfer }, currentRouteId);
    }
  }, [view, setViews, currentRouteId]);

  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const wrapperClasses = 'p-0.5 h-full max-h-full flex flex-col';
  return (
    <div className={wrapperClasses}>
      <ResizableGrid vertical onChange={handleOnLayoutChange}>
        <ResizableGridPanel minSize={75}>
          <PortfolioGridChild>
            <Tabs storageKey="console-portfolio-top">
              <Tab id="account-history" name={t('Account history')}>
                <AccountHistoryContainer />
              </Tab>
              <Tab id="positions" name={t('Positions')}>
                <PositionsContainer allKeys />
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <OrdersContainer />
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <FillsContainer />
              </Tab>
              <Tab id="ledger-entries" name={t('Ledger entries')}>
                <LedgerContainer />
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
                menu={<AccountsMenu />}
              >
                <AccountsContainer />
              </Tab>
              <Tab id="deposits" name={t('Deposits')} menu={<DepositsMenu />}>
                <DepositsContainer />
              </Tab>
              <Tab
                id="withdrawals"
                name={t('Withdrawals')}
                indicator={<WithdrawalsIndicator />}
                menu={<WithdrawalsMenu />}
              >
                <WithdrawalsContainer />
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
      <div className="border border-default h-full rounded-sm">{children}</div>
    </section>
  );
};
