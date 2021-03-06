import type { ReactNode } from 'react';

type LayoutRowProps = {
  children?: ReactNode;
  dataTestId?: string;
};

export const LayoutRow = ({ children, dataTestId }: LayoutRowProps) => {
  return (
    <div
      data-testid={dataTestId}
      className="lg:grid lg:gap-4 py-8 w-full lg:h-[42px] lg:grid-cols-[minmax(200px,_1fr),_150px_125px_100px]"
    >
      {children}
    </div>
  );
};
