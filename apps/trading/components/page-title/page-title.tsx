import type { ReactNode } from 'react';

export const PageTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1 className="text-4xl uppercase xl:text-5xl font-alpha calt">
      {children}
    </h1>
  );
};
