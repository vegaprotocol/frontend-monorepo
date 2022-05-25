import { useEffect } from 'react';
import { Web3Container } from '../../components/web3-container';
import { t } from '@vegaprotocol/react-helpers';
import { PositionsContainer } from '@vegaprotocol/positions';
import { OrderListContainer } from '@vegaprotocol/order-list';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { useVegaWallet } from '@vegaprotocol/wallet';

import { WithdrawalsContainer } from './withdrawals/withdrawals-container';
import { GridTab, GridTabs } from '../../components/grid-tabs';

type WalletState = {
  connect: boolean;
  manage: boolean;
};

type PortfolioPageProps = {
  setVegaWalletDialog: (state: WalletState) => void;
};

const Portfolio = ({ setVegaWalletDialog }: PortfolioPageProps) => {
  const { keypair } = useVegaWallet();

  useEffect(() => {
    if (!keypair) {
      setVegaWalletDialog({ connect: true, manage: false });
    }
  }, [keypair]);

  const tabClassName = 'p-[16px] pl-[316px]';

  return (
    <Web3Container
      render={() => (
        <div className="h-full text-ui">
          <main className="relative h-[calc(100%-200px)]">
            <aside className="absolute px-[8px] py-[16px] w-[300px] mt-[28px] h-[calc(100%-28px)] w-[300px] overflow-auto">
              <h2 className="text-h4 text-black dark:text-white">
                {t('Filters')}
              </h2>
            </aside>
            <section>
              <GridTabs group="portfolio">
                <GridTab id="positions" name={t('Positions')}>
                  <div className={tabClassName}>
                    <h4 className="text-h4 text-black dark:text-white">
                      {t('Positions')}
                    </h4>
                    <PositionsContainer />
                  </div>
                </GridTab>
                <GridTab id="orders" name={t('Orders')}>
                  <div className={tabClassName}>
                    <h4 className="text-h4 text-black dark:text-white">
                      {t('Orders')}
                    </h4>
                    <OrderListContainer />
                  </div>
                </GridTab>
                <GridTab id="fills" name={t('Fills')}>
                  <div className={tabClassName}>
                    <h4 className="text-h4 text-black dark:text-white">
                      {t('Fills')}
                    </h4>
                  </div>
                </GridTab>
                <GridTab id="history" name={t('History')}>
                  <div className={tabClassName}>
                    <h4 className="text-h4 text-black dark:text-white">
                      {t('History')}
                    </h4>
                  </div>
                </GridTab>
              </GridTabs>
            </section>
          </main>
          <section className="fixed bottom-0 left-0 w-full h-[200px]">
            <GridTabs group="collaterals">
              <GridTab id="collateral" name={t('Collateral')}>
                <AccountsContainer />
              </GridTab>
              <GridTab id="deposits" name={t('Deposits')}>
                <h2>{t('Deposits...')}</h2>
              </GridTab>
              <GridTab id="withdrawals" name={t('Withdrawals')}>
                <WithdrawalsContainer />
              </GridTab>
            </GridTabs>
          </section>
        </div>
      )}
    />
  );
};

Portfolio.getInitialProps = () => ({
  page: 'portfolio',
});

export default Portfolio;
