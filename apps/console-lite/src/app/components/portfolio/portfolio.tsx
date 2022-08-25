import * as React from 'react';
import { AccountsContainer } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Tabs, Tab } from '@vegaprotocol/ui-toolkit';
import { OrderListContainer } from '@vegaprotocol/orders';
import { PositionsContainer } from '@vegaprotocol/positions';
import { FillsContainer } from '@vegaprotocol/fills';
import ConnectWallet from '../wallet-connector';

export const Portfolio = () => {
  const { keypair } = useVegaWallet();
  if (!keypair) {
    return (
      <section className="xl:w-1/2">
        <ConnectWallet />
      </section>
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
