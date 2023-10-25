import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, useSidebar } from '../sidebar';
import classNames from 'classnames';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';

export const LayoutWithSidebar = ({
  header,
  sidebar,
}: {
  header?: ReactNode;
  sidebar?: ReactNode;
}) => {
  const currentRouteId = useGetCurrentRouteId();
  const views = useSidebar((store) => store.views);
  const sidebarView = views[currentRouteId] || null;
  const sidebarOpen = sidebarView !== null;
  const gridClasses = classNames(
    'h-full relative z-0 grid',
    'grid-rows-[min-content_1fr_40px]',
    'lg:grid-rows-[min-content_1fr]',
    'lg:grid-cols-[1fr_280px_40px]',
    'xxxl:grid-cols-[1fr_320px_40px]'
  );

  return (
    <div className={gridClasses}>
      <div className="col-span-full">{header}</div>
      <main
        className={classNames('col-start-1 col-end-1 overflow-hidden', {
          'lg:col-end-3': !sidebarOpen,
          'hidden lg:block lg:col-end-2': sidebarOpen,
        })}
      >
        <Outlet />
      </main>
      <aside
        // min-h-0 is needed as this element is part of a grid, we want the content to be scrollable, without it it will push the grid element taller
        className={classNames(
          'col-start-1 lg:col-start-2 min-h-0 lg:border-l border-default lg:bg-vega-clight-800 dark:lg:bg-vega-cdark-800',
          {
            hidden: !sidebarOpen,
          }
        )}
      >
        <SidebarContent />
      </aside>
      <div
        className={classNames(
          'bg-vega-clight-800 dark:bg-vega-cdark-800',
          'border-t lg:border-l lg:border-t-0 border-default',
          'row-start-3 col-start-1 cols-span-full',
          'lg:row-start-2 lg:row-span-full lg:col-start-3'
        )}
      >
        <Sidebar options={sidebar} />
      </div>
    </div>
  );
};
