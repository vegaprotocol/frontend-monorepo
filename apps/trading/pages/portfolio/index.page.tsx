import { Web3Container } from '../../components/web3-container';
import { t } from '@vegaprotocol/react-helpers';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/order-list';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { AnchorButton, Tab, Tabs } from '@vegaprotocol/ui-toolkit';
import { WithdrawalsContainer } from './withdrawals/withdrawals-container';

const Portfolio = () => {
  const tabClassName = 'p-[16px] pl-[316px]';

  return (
    <Web3Container>
      <div className="h-full text-ui">
        <main className="relative h-[calc(100%-200px)]">
          <aside className="absolute px-[8px] py-[16px] w-[300px] mt-[28px] h-[calc(100%-28px)] w-[300px] overflow-auto">
            <h2 className="text-h4 text-black dark:text-white">
              {t('Filters')}
            </h2>
          </aside>
          <section data-testid="portfolio-grid">
            <Tabs>
              <Tab id="positions" name={t('Positions')}>
                <div className={tabClassName}>
                  <h4 className="text-h4 text-black dark:text-white">
                    {t('Positions')}
                  </h4>
                  <PositionsContainer />
                </div>
              </Tab>
              <Tab id="orders" name={t('Orders')}>
                <div className={tabClassName}>
                  <h4 className="text-h4 text-black dark:text-white">
                    {t('Orders')}
                  </h4>
                  <OrderListContainer />
                </div>
              </Tab>
              <Tab id="fills" name={t('Fills')}>
                <div className={tabClassName}>
                  <h4 className="text-h4 text-black dark:text-white">
                    {t('Fills')}
                  </h4>
                </div>
              </Tab>
              <Tab id="history" name={t('History')}>
                <div className={tabClassName}>
                  <h4 className="text-h4 text-black dark:text-white">
                    {t('History')}
                  </h4>
                </div>
              </Tab>
            </Tabs>
          </section>
        </main>
        <section className="fixed bottom-0 left-0 w-full h-[200px]">
          <Tabs>
            <Tab id="collateral" name={t('Collateral')}>
              <AccountsContainer />
            </Tab>
            <Tab id="deposits" name={t('Deposits')}>
              <AnchorButton data-testid="deposit" href="/portfolio/deposit">
                {t('Deposit')}
              </AnchorButton>
            </Tab>
            <Tab id="withdrawals" name={t('Withdrawals')}>
              <WithdrawalsContainer />
            </Tab>
          </Tabs>
        </section>
      </div>
    </Web3Container>
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;
