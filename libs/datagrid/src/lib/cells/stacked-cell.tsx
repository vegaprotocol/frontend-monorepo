import type { ReactNode } from 'react';

export const StackedCell = ({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary: ReactNode;
}) => {
  return (
    <div className="leading-4">
      <div
        className="text-ellipsis whitespace-nowrap overflow-hidden"
        data-testid="stack-cell-primary"
      >
        {primary}
      </div>
      <div
        data-testid="stack-cell-secondary"
        className="text-ellipsis whitespace-nowrap overflow-hidden text-muted"
      >
        {secondary}
      </div>
    </div>
  );
};
