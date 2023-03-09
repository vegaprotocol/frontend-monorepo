import classNames from 'classnames';
import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}
export const Panel = ({ children, className }: PanelProps) => (
  <div
    className={classNames(
      'border border-vega-light-150 dark:border-vega-dark-150 rounded-md p-5 mb-5',
      className
    )}
  >
    {children}
  </div>
);
