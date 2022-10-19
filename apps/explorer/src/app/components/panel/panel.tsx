import classNames from 'classnames';
import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}
export const Panel = ({ children, className }: PanelProps) => (
  <div
    className={classNames(
      'border border-zinc-200 dark:border-zinc-800 rounded-md p-5 mb-5',
      className
    )}
  >
    {children}
  </div>
);
