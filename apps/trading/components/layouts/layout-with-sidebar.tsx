import { Outlet, Routes, Route } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '../sidebar';
import classNames from 'classnames';
import { Routes as AppRoutes } from '../../pages/client-router';
import { MarketHeader } from '../market-header';
import { LiquidityHeader } from '../liquidity-header';

export const LayoutWithSidebar = () => {
  const sidebarView = useSidebar((store) => store.view);
  const sidebarOpen = sidebarView !== null;

  const gridClasses = classNames(
    'h-full relative z-0 grid',
    'grid-rows-[min-content_1fr]',
    'grid-cols-[1fr_45px]',
    'lg:grid-cols-[1fr_350px_45px]'
  );

  return (
    <div className={gridClasses}>
      <div className="col-span-full">
        <Routes>
          <Route path={AppRoutes.MARKET} element={<MarketHeader />} />
          <Route path={AppRoutes.LIQUIDITY} element={<LiquidityHeader />} />
        </Routes>
      </div>
      <main
        className={classNames('col-start-1 col-end-1', {
          'lg:col-end-3': !sidebarOpen,
          'hidden lg:block lg:col-end-2': sidebarOpen,
        })}
      >
        <Outlet />
      </main>
      <aside
        // min-h-0 is needed as this element is part of a grid, we want the content to be scrollable, without it it will push the grid element taller
        className={classNames('col-start-1 lg:col-start-2 min-h-0', {
          hidden: !sidebarOpen,
        })}
      >
        <SidebarContent />
      </aside>
      <div className="col-start-2 lg:col-start-3 bg-vega-clight-800 dark:bg-vega-cdark-800 border-l border-default">
        <Sidebar />
      </div>
    </div>
  );
};
