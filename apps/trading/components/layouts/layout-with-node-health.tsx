import { Outlet } from 'react-router-dom';
import { NodeHealthContainer } from '../node-health';
import classNames from 'classnames';

export const LayoutWithNodeHealth = () => {
  return (
    <>
      <Outlet />
      <div
        className={classNames(
          'hidden lg:block',
          'absolute bottom-1.5 right-1.5 z-10',
          'w-5 h-5 p-1',
          'bg-vega-clight-500 dark:bg-vega-cdark-500 rounded',
          'flex'
        )}
      >
        <NodeHealthContainer variant="compact" />
      </div>
    </>
  );
};
