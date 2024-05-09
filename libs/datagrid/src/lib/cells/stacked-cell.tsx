import type { ReactNode } from 'react';

export const StackedCell = ({
  primary,
  secondary,
  primaryIcon,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  primaryIcon?: ReactNode;
}) => {
  return (
    <div className="leading-4">
      <div
        className="text-ellipsis whitespace-nowrap overflow-hidden"
        data-testid="stack-cell-primary"
      >
        <span>{primary}</span>
        {primaryIcon && <span>{primaryIcon}</span>}
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
