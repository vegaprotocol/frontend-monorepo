import { Web3Container } from '../../components/web3-container';
import { t } from '@vegaprotocol/react-helpers';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/orders';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { AnchorButton, Tab, Tabs } from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals/withdrawals-container';
import { FillsContainer } from '@vegaprotocol/fills';
import classNames from 'classnames';
import type { ReactNode } from 'react';

const Portfolio = () => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'grid gap-4 grid-rows-[1fr_300px]',
    'bg-black-10 dark:bg-white-10',
    'text-ui'
  );
  const tabContentClassName = 'h-full grid gap-4 grid-rows-[min-content_1fr]';
  return (
    <div className={wrapperClasses}>
      <PortfolioGridChild>
        <Tabs>
          <Tab id="positions" name={t('Positions')}>
            <div className={tabContentClassName}>
              <h4 className="text-h4 text-black dark:text-white p-8">
                {t('Positions')}
              </h4>
              <div>
                <PositionsContainer />
              </div>
            </div>
          </Tab>
          <Tab id="orders" name={t('Orders')}>
            <div className={tabContentClassName}>
              <h4 className="text-h4 text-black dark:text-white p-8">
                {t('Orders')}
              </h4>
              <div>
                <OrderListContainer />
              </div>
            </div>
          </Tab>
          <Tab id="fills" name={t('Fills')}>
            <div className={tabContentClassName}>
              <h4 className="text-h4 text-black dark:text-white p-8">
                {t('Fills')}
              </h4>
              <div>
                <FillsContainer />
              </div>
            </div>
          </Tab>
        </Tabs>
      </PortfolioGridChild>
      <PortfolioGridChild>
        <Tabs>
          <Tab id="collateral" name={t('Collateral')}>
            <AccountsContainer />
          </Tab>
          <Tab id="deposits" name={t('Deposits')}>
            <div className={tabContentClassName}>
              <div className="p-8">
                <AnchorButton data-testid="deposit" href="/portfolio/deposit">
                  {t('Deposit')}
                </AnchorButton>
              </div>
            </div>
          </Tab>
          <Tab id="withdrawals" name={t('Withdrawals')}>
            <Web3Container>
              <WithdrawalsContainer />
            </Web3Container>
          </Tab>
        </Tabs>
      </PortfolioGridChild>
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
