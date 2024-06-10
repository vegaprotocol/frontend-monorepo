import classNames from 'classnames';
import type { ReactNode } from 'react';

export const StackedCell = ({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  className?: string;
}) => {
  const rowClass = 'text-ellipsis whitespace-nowrap overflow-hidden';

  return (
    <div className={classNames('leading-4', className)}>
      <div className={rowClass} data-testid="stack-cell-primary">
        <span>{primary}</span>
      </div>
      <div
        data-testid="stack-cell-secondary"
        className={classNames(rowClass, 'text-xs text-muted')}
      >
        {secondary}
      </div>
    </div>
  );
};
