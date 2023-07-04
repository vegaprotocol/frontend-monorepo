import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '../sidebar';
import classNames from 'classnames';
import { Navbar } from '../navbar';
import { ViewingBanner } from '../viewing-banner';
import { AnnouncementBanner, UpgradeBanner } from '../banner';
import {
  ProtocolUpgradeCountdownMode,
  ProtocolUpgradeProposalNotification,
} from '@vegaprotocol/proposals';

export const Layout = () => {
  const location = useLocation();
  const { view } = useSidebar();
  const sidebarOpen = view !== null;

  const gridClasses = classNames(
    'h-full relative z-0 grid',
    'grid-rows-[repeat(4,min-content),minmax(0,1fr)]',
    'grid-cols-[45px_1fr]',
    'lg:grid-cols-[45px_350px_1fr]'
  );

  return (
    <div className={gridClasses}>
      <div className="bg-vega-yellow col-start-2 col-span-full row-start-1">
        {/* <AnnouncementBanner /> */}
      </div>
      <div className="col-start-1 row-span-full bg-vega-clight-800 dark:bg-vega-cdark-800 border-r border-default">
        <Sidebar />
      </div>
      <div
        className={classNames('row-span-full row-start-4 col-start-2', {
          hidden: !sidebarOpen,
        })}
      >
        <SidebarContent />
      </div>
      <div className="col-span-full col-start-2 row-start-2">
        <Navbar theme="system" />
      </div>
      <div
        className="bg-vega-pink col-span-full col-start-2 row-start-3"
        data-testid="banners"
      >
        <ProtocolUpgradeProposalNotification
          mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
        />
        <ViewingBanner />
        <UpgradeBanner showVersionChange={true} />
      </div>
      <main
        className={classNames(
          'row-start-4 row-span-full col-start-2 col-span-full',
          {
            'col-start-2': !sidebarOpen,
            'col-start-3': sidebarOpen,
            'hidden lg:block': sidebarOpen,
          }
        )}
        data-testid={location.pathname}
      >
        <Outlet />
      </main>
    </div>
  );
};
