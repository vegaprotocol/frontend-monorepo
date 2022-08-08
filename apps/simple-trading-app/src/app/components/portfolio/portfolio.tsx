import { useContext } from 'react';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Button, Splash, Tabs, Tab } from '@vegaprotocol/ui-toolkit';
import LocalContext from '../../context/local-context';
import { OrderListContainer } from '@vegaprotocol/orders';
import { PositionsContainer } from '@vegaprotocol/positions';
import { FillsContainer } from '@vegaprotocol/fills';

export const Portfolio = () => {
  const { keypair } = useVegaWallet();
  const { setConnect } = useContext(LocalContext);
  if (!keypair) {
    return (
      <Splash>
        <div className="text-center">
          <p className="mb-12" data-testid="connect-vega-wallet-text">
            {t('Connect your Vega wallet')}
          </p>
          <Button
            onClick={() => setConnect(true)}
            data-testid="vega-wallet-connect"
          >
            {t('Connect')}
          </Button>
        </div>
      </Splash>
    );
  }
  return (
    <Tabs>
      <Tab id="assets" name={t('Assets')}>
        <AccountsContainer />
      </Tab>
      <Tab id="positions" name={t('Positions')}>
        <PositionsContainer />
      </Tab>
      <Tab id="orders" name={t('Orders')}>
        <OrderListContainer />
      </Tab>
      <Tab id="fills" name={t('Fills')}>
        <FillsContainer />
      </Tab>
    </Tabs>
  );
};
