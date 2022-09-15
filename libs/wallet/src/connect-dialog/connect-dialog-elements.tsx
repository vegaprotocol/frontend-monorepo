import type { ReactNode } from 'react';

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-2xl uppercase mb-6 text-center">{children}</h1>;
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="mb-6">{children}</div>;
};
