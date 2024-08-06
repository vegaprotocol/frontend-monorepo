import type { ReactNode } from 'react';

export const locators = {
  header: 'header',
};

export const Header = ({ content }: { content: ReactNode }) => {
  return (
    <h1
      style={{ wordBreak: 'break-word' }}
      data-testid={locators.header}
      className="flex justify-center flex-col text-2xl text-white"
    >
      {content}
    </h1>
  );
};
