import React from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';
import ConnectWallet from '../wallet-connector';
import { useOutlet, useLocation } from 'react-router-dom';
import { HorizontalMenu } from '../horizontal-menu';
import * as constants from './constants';

export const Portfolio = () => {
  const { pubKey } = useVegaWallet();
  const { pathname } = useLocation();
  const module = pathname.split('/portfolio/')?.[1] ?? '';
  const outlet = useOutlet({ partyId: pubKey || '' });
  if (!pubKey) {
    return (
      <section className="xl:w-1/2">
        <ConnectWallet />
      </section>
    );
  }

  return (
    <div className="h-full p-4 md:p-6 grid grid-rows-[min-content_1fr]">
      <HorizontalMenu active={module} items={constants.PORTFOLIO_ITEMS} />
      {outlet}
    </div>
  );
};
