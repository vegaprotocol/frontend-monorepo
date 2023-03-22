import type { ReactNode } from 'react';

export interface PartyBlockProps {
  children: ReactNode;
  title: string;
}

export function PartyBlock({ children, title }: PartyBlockProps) {
  return (
    <div className="border-2 min-h-[125px] border-solid border-vega-light-100 dark:border-vega-dark-200 p-5 mt-5">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}
