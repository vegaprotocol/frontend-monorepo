import classNames from 'classnames';
import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}
export const Panel = ({ children, className }: PanelProps) => (
  <div className={classNames('border p-5 mb-5', className)}>{children}</div>
);
