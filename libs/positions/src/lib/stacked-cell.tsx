import type { ReactNode } from 'react';

export const StackedCell = ({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary: ReactNode;
}) => {
  return (
    <div className="leading-4 text-ellipsis whitespace-nowrap overflow-hidden">
      <div data-testid="stack-cell-primary">{primary}</div>
      <div data-testid="stack-cell-secondary" className="text-muted">
        {secondary}
      </div>
    </div>
  );
};
