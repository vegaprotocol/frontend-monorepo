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
    'grid-cols-[1fr_45px]',
    'lg:grid-cols-[1fr_350px_45px]'
  );

  return (
    <div className={gridClasses}>
      <div className="col-start-1 col-span-full row-start-1">
        <AnnouncementBanner />
      </div>
      <div className="col-start-1 col-end-2 lg:col-end-3 row-start-2">
        <Navbar theme="system" />
      </div>
      <div
        className={classNames('row-start-4 col-start-1 lg:col-start-2', {
          hidden: !sidebarOpen,
        })}
      >
        <SidebarContent />
      </div>
      <div className="col-start-2 lg:col-start-3 row-span-full bg-vega-clight-800 dark:bg-vega-cdark-800 border-l border-default">
        <Sidebar />
      </div>
      <div
        className="col-start-1 col-end-2 lg:col-end-3 col-span-full row-start-3"
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
          'row-start-4 row-span-full col-start-1 col-end-1',
          {
            'lg:col-end-3': !sidebarOpen,
            'lg:col-end-2': sidebarOpen,
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
