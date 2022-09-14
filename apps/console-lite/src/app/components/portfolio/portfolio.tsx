import React, { useMemo } from 'react';
import { AccountManager } from './accounts';
import { useVegaWallet } from '@vegaprotocol/wallet';
import ConnectWallet from '../wallet-connector';
import { DepositContainer } from '../deposits';
import { useParams } from 'react-router-dom';
import { HorizontalMenu } from '../horizontal-menu';
import * as constants from './constants';
import { PositionsManager } from './positions';
import { OrdersManager } from './orders';
import { FillsManager } from './fills';

type RouterParams = {
  module?: string;
};

export const Portfolio = () => {
  const { keypair } = useVegaWallet();
  const params = useParams<RouterParams>();

  const module = useMemo(() => {
    if (!keypair) {
      return (
        <section className="xl:w-1/2">
          <ConnectWallet />
        </section>
      );
    }

    switch (params?.module) {
      case constants.PORTFOLIO_ASSETS:
      default:
        return <AccountManager partyId={keypair.pub} />;
      case constants.PORTFOLIO_POSITIONS:
        return <PositionsManager partyId={keypair.pub} />;
      case constants.PORTFOLIO_ORDERS:
        return <OrdersManager partyId={keypair.pub} />;
      case constants.PORTFOLIO_FILLS:
        return <FillsManager partyId={keypair.pub} />;
      case constants.PORTFOLIO_DEPOSITS:
        return <DepositContainer />;
    }
  }, [params?.module, keypair]);

  return (
    <div className="mt-2 h-full grid grid-rows-[min-content_1fr]">
      <HorizontalMenu
        active={params?.module}
        items={constants.PORTFOLIO_ITEMS}
      />
      {module}
    </div>
  );
};
