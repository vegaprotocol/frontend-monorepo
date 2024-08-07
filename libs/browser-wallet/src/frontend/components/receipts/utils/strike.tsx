import type { ReactNode } from 'react';

export const locators = {
  strike: 'strike',
};

export const Strike = ({ children }: { children: ReactNode }) => {
  return (
    <s data-testid={locators.strike} className="text-vega-dark-300">
      {children}
    </s>
  );
};
