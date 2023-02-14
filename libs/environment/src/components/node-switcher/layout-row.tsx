import type { ReactNode } from 'react';

type LayoutRowProps = {
  children?: ReactNode;
  dataTestId?: string;
};

export const LayoutRow = ({ children, dataTestId }: LayoutRowProps) => {
  return (
    <div
      data-testid={dataTestId}
      className="lg:grid lg:gap-2 py-2 w-full lg:grid-cols-[minmax(200px,_1fr),_150px_125px_100px]"
    >
      {children}
    </div>
  );
};
