import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '../../components/sidebar';
import classNames from 'classnames';
import { Navbar } from '../../components/navbar';
import { ViewingBanner } from '../../components/viewing-banner';
import { AnnouncementBanner, UpgradeBanner } from '../../components/banner';
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
    {
      'grid-cols-[45px_350px_1fr]': sidebarOpen,
      'grid-cols-[45px_1fr]': !sidebarOpen,
    }
  );

  const mainClasses = classNames('row-start-4 row-span-full');
  return (
    <div className={gridClasses}>
      <div className="col-span-full row-start-1 bg-vega-pink">
        <AnnouncementBanner />
      </div>
      <div className="row-span-full row-start-2 bg-vega-light-100 dark:bg-vega-dark-100 border-r border-default">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="row-span-full row-start-4 col-start-2 p-4">
          <SidebarContent />
        </div>
      )}
      <div className="col-span-full col-start-2 row-start-2 bg-vega-yellow">
        <Navbar theme="system" />
      </div>
      <div
        className="col-span-full col-start-2 row-start-3 bg-vega-pink-350"
        data-testid="banners"
      >
        <ProtocolUpgradeProposalNotification
          mode={ProtocolUpgradeCountdownMode.IN_ESTIMATED_TIME_REMAINING}
        />
        <ViewingBanner />
        <UpgradeBanner showVersionChange={true} />
      </div>
      <main className={mainClasses} data-testid={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
};
