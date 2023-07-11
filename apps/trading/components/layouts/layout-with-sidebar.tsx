import { Outlet, Route, Routes } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '../sidebar';
import classNames from 'classnames';
import { Navbar } from '../navbar';
import { NavHeader } from '../nav-header';
import { Routes as AppRoutes } from '../../pages/client-router';

export const LayoutWithSidebar = () => {
  const sidebarView = useSidebar((store) => store.view);
  const sidebarOpen = sidebarView !== null;

  const gridClasses = classNames(
    'h-full relative z-0 grid',
    'grid-cols-[1fr]',
    'grid-rows-[min-content_1fr_min-content]',
    'lg:grid-rows-[min-content_1fr]',
    'lg:grid-cols-[1fr_350px_45px]'
  );

  return (
    <div className={gridClasses}>
      <div className="col-start-1 col-end-2 lg:col-end-3">
        <Navbar>
          <Routes>
            <Route
              path={AppRoutes.MARKETS}
              // render nothing for markets/all, otherwise markets/:marketId will match with markets/all
              element={null}
            />
            <Route path={AppRoutes.MARKET} element={<NavHeader />} />
          </Routes>
        </Navbar>
      </div>
      <section
        className={classNames('col-start-1 col-end-1', {
          'lg:col-end-3': !sidebarOpen,
          'hidden lg:block lg:col-end-2': sidebarOpen,
        })}
      >
        <Outlet />
      </section>
      <div
        // min-h-0 is needed as this element is part of a grid, we want the content to be scrollable, without it it will push the grid element taller
        className={classNames('col-start-1 lg:col-start-2 min-h-0', {
          hidden: !sidebarOpen,
        })}
      >
        <SidebarContent />
      </div>
      <div
        className={classNames(
          'bg-vega-clight-800 dark:bg-vega-cdark-800',
          'border-t lg:border-l border-default',
          'row-start-3 col-start-1 cols-span-full',
          'lg:row-start-1 lg:row-span-full lg:col-start-3'
        )}
      >
        <Sidebar />
      </div>
    </div>
  );
};
