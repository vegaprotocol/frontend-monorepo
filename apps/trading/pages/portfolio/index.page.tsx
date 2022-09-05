import { Web3Container } from '@vegaprotocol/web3';
import { t } from '@vegaprotocol/react-helpers';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/orders';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { ResizableGridPanel, Tab, Tabs } from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals-container';
import { FillsContainer } from '@vegaprotocol/fills';
import type { ReactNode } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { DepositsContainer } from './deposits-container';
import { ResizableGrid } from '@vegaprotocol/ui-toolkit';
import { LayoutPriority } from 'allotment';

const Portfolio = () => {
  const wrapperClasses = 'h-full max-h-full flex flex-col';
  const tabContentClassName = 'h-full grid grid-rows-[min-content_1fr]';
  return (
    <div className={wrapperClasses}>
      <ResizableGrid vertical={true}>
        <ResizableGridPanel minSize={75}>
          <PortfolioGridChild>
            <Tabs>
              <Tab id="positions" name={t('Positions')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-xl p-4">{t('Positions')}</h4>
                    <div>
                      <PositionsContainer />
                    </div>
                  </div>
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-xl p-4">{t('Orders')}</h4>
                    <div>
                      <OrderListContainer />
                    </div>
                  </div>
                </VegaWalletContainer>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-xl p-4">{t('Fills')}</h4>
                    <div>
                      <FillsContainer />
                    </div>
                  </div>
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
            <Tabs>
              <Tab id="withdrawals" name={t('Withdrawals')}>
                <WithdrawalsContainer />
              </Tab>
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
            </Tabs>
          </PortfolioGridChild>
        </ResizableGridPanel>
      </ResizableGrid>
    </div>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;

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
