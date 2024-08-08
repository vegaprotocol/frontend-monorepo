import type { ReactNode } from 'react';

export interface PartyBlockProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

export function PartyBlock({ children, title, action }: PartyBlockProps) {
  return (
    <div className="border-2 min-h-[138px] border-gs-600  p-5 mt-5">
      <div
        className="flex flex-col md:flex-row gap-1 justify-between content-start mb-2"
        data-testid="page-title"
      >
        <h3 className="font-semibold text-lg">{title}</h3>

        {action ? action : null}
      </div>

      {children}
    </div>
  );
}
