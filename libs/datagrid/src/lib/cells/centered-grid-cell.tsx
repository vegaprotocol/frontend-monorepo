import type { ReactNode } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';

export const CenteredGridCellWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex h-[20px] p-0 justify-items-center items-center',
      className
    )}
  >
    <div className="w-full self-center">{children}</div>
  </div>
);
