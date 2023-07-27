import type { ReactNode } from 'react';
import classNames from 'classnames';

export const CenteredGridCellWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={classNames('flex h-[20px] p-0 justify-items-center', className)}
  >
    <div className="w-full self-center">{children}</div>
  </div>
);
