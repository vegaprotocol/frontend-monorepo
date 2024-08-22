import type { ReactNode } from 'react';

export const locators = {
  strike: 'strike',
};

export const Strike = ({ children }: { children: ReactNode }) => {
  return (
    <s data-testid={locators.strike} className="text-surface-0-fg-muted">
      {children}
    </s>
  );
};
