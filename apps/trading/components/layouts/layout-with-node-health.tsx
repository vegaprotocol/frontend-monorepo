import { Outlet } from 'react-router-dom';
import { NodeHealthContainer } from '../node-health';
import { cn } from '@vegaprotocol/ui-toolkit';

export const LayoutWithNodeHealth = () => {
  return (
    <>
      <Outlet />
      <div
        className={cn('hidden lg:block', 'absolute bottom-1.5 right-1.5 z-10')}
      >
        <NodeHealthContainer variant="compact" />
      </div>
    </>
  );
};
