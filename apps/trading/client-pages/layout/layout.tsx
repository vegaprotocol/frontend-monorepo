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
import * as DialogPrimitives from '@radix-ui/react-dialog';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

export const Layout = () => {
  const location = useLocation();
  const { view, setView } = useSidebar();
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);
  const sidebarOpen = view !== null;

  const commonClasses = [
    'h-full relative z-0 grid',
    'grid-rows-[repeat(4,min-content),minmax(0,1fr)]',
  ];
  const largeClasses = classNames(commonClasses, {
    'grid-cols-[45px_350px_1fr]': sidebarOpen,
    'grid-cols-[45px_1fr]': !sidebarOpen,
  });
  const smallClasses = classNames(commonClasses, 'grid-cols-[45px_1fr]');
  const gridClasses = largeScreen ? largeClasses : smallClasses;

  const mainClasses = classNames('row-start-4 row-span-full');
  return (
    <>
      <div className={gridClasses}>
        <div className="col-span-full row-start-1 bg-vega-pink">
          <AnnouncementBanner />
        </div>
        <div className="row-span-full row-start-2 bg-vega-light-100 dark:bg-vega-dark-100 border-r border-default">
          <Sidebar />
        </div>
        {largeScreen && sidebarOpen && (
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
      {!largeScreen && (
        <DialogPrimitives.Root
          open={sidebarOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setView(null);
            }
          }}
        >
          <DialogPrimitives.Portal>
            <DialogPrimitives.Overlay />
            <DialogPrimitives.Content
              className={classNames(
                'fixed h-full max-w-[500px] w-[90vw] z-10 top-0 left-0 transition-transform',
                'bg-white dark:bg-black',
                'border-r border-default'
              )}
            >
              <DialogPrimitives.Close className="absolute top-0 right-0 p-2">
                <VegaIcon name={VegaIconNames.CROSS} />
              </DialogPrimitives.Close>
              {sidebarOpen && (
                <div className="py-8 px-4">
                  <SidebarContent />
                </div>
              )}
            </DialogPrimitives.Content>
          </DialogPrimitives.Portal>
        </DialogPrimitives.Root>
      )}
    </>
  );
};
