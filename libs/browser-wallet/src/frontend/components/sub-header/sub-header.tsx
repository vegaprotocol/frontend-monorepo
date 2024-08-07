import type { ReactNode } from 'react';

export const locators = {
  subHeader: 'sub-header',
};

export const SubHeader = ({ content }: { content: ReactNode }) => {
  return (
    <h1
      data-testid={locators.subHeader}
      className="text-vega-dark-300 text-sm uppercase"
    >
      {content}
    </h1>
  );
};
