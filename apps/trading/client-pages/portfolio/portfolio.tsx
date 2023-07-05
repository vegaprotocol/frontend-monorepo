import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LayoutPriority } from 'allotment';
import { titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useIncompleteWithdrawals } from '@vegaprotocol/withdraws';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import { usePageTitleStore } from '../../stores';
import { useMarketClickHandler } from '../../lib/hooks/use-market-click-handler';
import { AccountsContainer } from '../../components/accounts-container';
import { DepositsContainer } from './deposits-container';
import { FillsContainer } from '../../components/fills-container';
import { PositionsContainer } from '../../components/positions-container';
import { WithdrawalsContainer } from './withdrawals-container';
import { OrdersContainer } from '../../components/orders-container';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { LedgerContainer } from '../../components/ledger-container';
import { AccountHistoryContainer } from './account-history-container';
import {
  ResizableGrid,
  ResizableGridPanel,
  usePaneLayout,
} from '../../components/resizable-grid';
import { ViewType, useSidebar } from '../../components/sidebar';

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
  const { init, view, setView } = useSidebar();
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Portfolio')]));
  }, [updateTitle]);

  useEffect(() => {
    if (init && view === null) {
      setView({ type: ViewType.Transfer });
    }
  }, [init, view, setView]);

  const onMarketClick = useMarketClickHandler(true);
  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const wrapperClasses = 'pt-0.5 h-full max-h-full flex flex-col';
  return (
    <div className={wrapperClasses}>
      <ResizableGrid vertical onChange={handleOnLayoutChange}>
        <ResizableGridPanel minSize={75}>
          <PortfolioGridChild>
            <Tabs storageKey="console-portfolio-top">
              <Tab id="account-history" name={t('Account history')}>
                <VegaWalletContainer>
                  <AccountHistoryContainer />
                </VegaWalletContainer>
              </Tab>
              <Tab id="positions" name={t('Positions')}>
                <VegaWalletContainer>
                  <PositionsContainer onMarketClick={onMarketClick} allKeys />
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <VegaWalletContainer>
                  <OrdersContainer />
                </VegaWalletContainer>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <VegaWalletContainer>
                  <FillsContainer onMarketClick={onMarketClick} />
                </VegaWalletContainer>
              </Tab>
              <Tab id="ledger-entries" name={t('Ledger entries')}>
                <VegaWalletContainer>
                  <LedgerContainer />
                </VegaWalletContainer>
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
              <Tab id="collateral" name={t('Collateral')}>
                <VegaWalletContainer>
                  <AccountsContainer />
                </VegaWalletContainer>
              </Tab>
              <Tab id="deposits" name={t('Deposits')}>
                <VegaWalletContainer>
                  <DepositsContainer />
                </VegaWalletContainer>
              </Tab>
              <Tab
                id="withdrawals"
                name={t('Withdrawals')}
                indicator={<WithdrawalsIndicator />}
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
