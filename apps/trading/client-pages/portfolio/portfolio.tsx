import { titlefy } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/orders';
import {
  ResizableGridPanel,
  Tab,
  LocalStoragePersistTabs as Tabs,
} from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals-container';
import { FillsContainer } from '@vegaprotocol/fills';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { DepositsContainer } from './deposits-container';
import { ResizableGrid } from '@vegaprotocol/ui-toolkit';
import { LayoutPriority } from 'allotment';
import { usePageTitleStore } from '../../stores';
import { LedgerContainer } from '@vegaprotocol/ledger';
import { AccountsContainer } from '../../components/accounts-container';
import { AccountHistoryContainer } from './account-history-container';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';

export const Portfolio = () => {
  const { updateTitle } = usePageTitleStore((store) => ({
    updateTitle: store.updateTitle,
  }));

  const navigate = useNavigate();

  useEffect(() => {
    updateTitle(titlefy([t('Portfolio')]));
  }, [updateTitle]);

  const onMarketClick = (marketId: string) => {
    navigate(Links[Routes.MARKET](marketId), {
      replace: true,
    });
  };

  const wrapperClasses = 'h-full max-h-full flex flex-col';
  return (
    <div className={wrapperClasses}>
      <ResizableGrid vertical>
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
                  />
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <VegaWalletContainer>
                  <OrderListContainer onMarketClick={onMarketClick} />
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
          preferredSize={300}
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
              <Tab id="withdrawals" name={t('Withdrawals')}>
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
