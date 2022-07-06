import type { ReactNode } from 'react';

type LayoutRowProps = {
  children?: ReactNode;
};

export const LayoutRow = ({ children }: LayoutRowProps) => {
  return (
    <div className="grid gap-4 py-8 w-full h-[42px] grid-cols-[minmax(200px,_1fr),_150px_125px_100px]">
      {children}
    </div>
  );
};
