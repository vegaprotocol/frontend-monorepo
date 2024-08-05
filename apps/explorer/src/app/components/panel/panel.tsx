import classNames from 'classnames';
import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}
export const Panel = ({ children, className }: PanelProps) => (
  <div
    className={classNames(
      'border border-gs-200  rounded-md p-5 mb-5',
      className
    )}
  >
    {children}
  </div>
);
