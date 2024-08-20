import { cn } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { ReactNode } from 'react';
import { AnnouncementBanner } from '@vegaprotocol/announcements';
import { Nav } from '../nav';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ProtocolUpgradeCountdownMode,
  ProtocolUpgradeInProgressNotification,
  ProtocolUpgradeProposalNotification,
} from '@vegaprotocol/proposals';
import { ViewingAsBanner } from '@vegaprotocol/ui-toolkit';
import { RewardsMovedNotification } from '../notifications/rewards-moved-notification';

interface AppLayoutProps {
  children: ReactNode;
}
export const AppLayout = ({ children }: AppLayoutProps) => {
  const { ANNOUNCEMENTS_CONFIG_URL } = useEnvironment();
  const { isReadOnly } = useVegaWallet();
  const AppLayoutClasses = cn(
    'app w-full max-w-[1500px] mx-auto grid',
    'lg:text-body-large',
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
        <Nav />
        <NotificationsContainer />
      </div>
      <div className={AppLayoutClasses}>{children}</div>
    </div>
  );
};

const NotificationsContainer = () => {
  const { isReadOnly, pubKey, disconnect } = useVegaWallet();

  return (
    <div data-testid="banners">
      <RewardsMovedNotification />
      <ProtocolUpgradeProposalNotification
        mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
      />
      <ProtocolUpgradeInProgressNotification />
      {isReadOnly ? (
        <ViewingAsBanner pubKey={pubKey} disconnect={disconnect} />
      ) : null}
    </div>
  );
};
