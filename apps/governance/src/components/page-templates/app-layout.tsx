import classNames from 'classnames';
import { useVegaWallet } from '@vegaprotocol/wallet';
import type { ReactNode } from 'react';
import { AnnouncementBanner } from '@vegaprotocol/announcements';
import { Nav } from '../nav';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import React from 'react';

interface AppLayoutProps {
  children: ReactNode;
}
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { VEGA_ENV, ANNOUNCEMENTS_CONFIG_URL } = useEnvironment();
  const { isReadOnly } = useVegaWallet();
  const AppLayoutClasses = classNames(
    'app w-full max-w-[1500px] mx-auto grid',
    'font-alpha lg:text-body-large',
    {
      'grid-rows-[repeat(2,min-content)_1fr_min-content]': !isReadOnly,
      'grid-rows-[repeat(3,min-content)_1fr_min-content]': isReadOnly,
    }
  );

  return (
    <div className="min-h-full">
      <div className="lg:text-body-large">
        {ANNOUNCEMENTS_CONFIG_URL && (
          <AnnouncementBanner
            app="governance"
            configUrl={ANNOUNCEMENTS_CONFIG_URL}
          />
        )}
        <Nav theme={VEGA_ENV === Networks.TESTNET ? 'yellow' : 'dark'} />
      </div>
      <div className={AppLayoutClasses}>{children}</div>
    </div>
  );
};
