import { Web3Container } from '../../components/web3-container';
import { t } from '@vegaprotocol/react-helpers';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/orders';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { Tab, Tabs } from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals-container';
import { FillsContainer } from '@vegaprotocol/fills';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { DepositsContainer } from './deposits-container';
import { ResizablePanel } from '@vegaprotocol/ui-toolkit';
import { Allotment, LayoutPriority } from 'allotment';

const Portfolio = () => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'flex flex-col',
    'bg-black-10 dark:bg-black-70',
    'text-ui'
  );
  const tabContentClassName = 'h-full grid gap-4 grid-rows-[min-content_1fr]';
  return (
    <div className={wrapperClasses}>
      <ResizablePanel vertical={true}>
        <Allotment.Pane minSize={75}>
          <PortfolioGridChild className="h-full">
            <Tabs>
              <Tab id="positions" name={t('Positions')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-h4 text-black dark:text-white p-8">
                      {t('Positions')}
                    </h4>
                    <div>
                      <PositionsContainer />
                    </div>
                  </div>
                </VegaWalletContainer>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-h4 text-black dark:text-white p-8">
                      {t('Orders')}
                    </h4>
                    <div>
                      <OrderListContainer />
                    </div>
                  </div>
                </VegaWalletContainer>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <VegaWalletContainer>
                  <div className={tabContentClassName}>
                    <h4 className="text-h4 text-black dark:text-white p-8">
                      {t('Fills')}
                    </h4>
                    <div>
                      <FillsContainer />
                    </div>
                  </div>
                </VegaWalletContainer>
              </Tab>
            </Tabs>
          </PortfolioGridChild>
        </Allotment.Pane>
        <Allotment.Pane
          priority={LayoutPriority.Low}
          preferredSize={300}
          minSize={50}
        >
          <PortfolioGridChild className="h-full mt-4">
            <Tabs>
              <Tab id="collateral" name={t('Collateral')}>
                <VegaWalletContainer>
                  <AccountsContainer />
                </VegaWalletContainer>
              </Tab>
              <Tab id="deposits" name={t('Deposits')}>
                <DepositsContainer />
              </Tab>
              <Tab id="withdrawals" name={t('Withdrawals')}>
                <Web3Container>
                  <VegaWalletContainer>
                    <WithdrawalsContainer />
                  </VegaWalletContainer>
                </Web3Container>
              </Tab>
            </Tabs>
          </PortfolioGridChild>
        </Allotment.Pane>
      </ResizablePanel>
    </div>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;

interface PortfolioGridChildProps {
  children: ReactNode;
  className?: string;
}

const PortfolioGridChild = ({
  children,
  className,
}: PortfolioGridChildProps) => {
  const gridChildClasses = classNames('bg-white dark:bg-black', className);
  return <section className={gridChildClasses}>{children}</section>;
};
