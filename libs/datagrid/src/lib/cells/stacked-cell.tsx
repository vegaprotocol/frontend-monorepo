import { cn } from '@vegaprotocol/utils';
import type { ReactNode } from 'react';

export const StackedCell = ({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) => {
  const rowClass = 'text-ellipsis whitespace-nowrap overflow-hidden';

  return (
    <div className={cn('leading-4', className)}>
      <div className={rowClass} data-testid="stack-cell-primary">
        <span>{primary}</span>
      </div>
      {secondary && (
        <div
          data-testid="stack-cell-secondary"
          className={cn(rowClass, 'text-xs text-muted')}
        >
          {secondary}
        </div>
      )}
    </div>
  );
};
