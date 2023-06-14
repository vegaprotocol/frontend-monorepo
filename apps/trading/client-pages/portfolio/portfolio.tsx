import { titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/orders';
import { Tab, LocalStoragePersistTabs as Tabs } from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals-container';
import { FillsContainer } from '@vegaprotocol/fills';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePaneLayout } from '@vegaprotocol/react-helpers';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { DepositsContainer } from './deposits-container';
import { LayoutPriority } from 'allotment';
import { usePageTitleStore } from '../../stores';
import { LedgerContainer } from '@vegaprotocol/ledger';
import { AccountsContainer } from '../../components/accounts-container';
import { AccountHistoryContainer } from './account-history-container';
import {
  useMarketClickHandler,
  useMarketLiquidityClickHandler,
} from '../../lib/hooks/use-market-click-handler';
import {
  ResizableGrid,
  ResizableGridPanel,
} from '../../components/resizable-grid';
import { useIncompleteWithdrawals } from '@vegaprotocol/withdraws';

const WithdrawalsIndicator = () => {
  const { ready } = useIncompleteWithdrawals();
  if (!ready || ready.length === 0) {
    return null;
  }
  return (
    <span className="bg-vega-blue-450 text-white text-[10px] rounded p-[3px] pb-[2px] leading-none">
      {ready.length}
    </span>
  );
};

export const Portfolio = () => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  useEffect(() => {
    updateTitle(titlefy([t('Portfolio')]));
  }, [updateTitle]);

  const onMarketClick = useMarketClickHandler(true);
  const onOrderTypeClick = useMarketLiquidityClickHandler();
  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const wrapperClasses = 'h-full max-h-full flex flex-col';
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
                  <PositionsContainer
                    onMarketClick={onMarketClick}
                    noBottomPlaceholder
                    allKeys
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <VegaWalletContainer>
                  <OrderListContainer
                    onMarketClick={onMarketClick}
                    onOrderTypeClick={onOrderTypeClick}
                  />
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
    <section className="bg-white dark:bg-black w-full h-full">
      {children}
    </section>
  );
};
