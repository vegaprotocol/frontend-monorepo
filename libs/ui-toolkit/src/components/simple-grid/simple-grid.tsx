import type { ReactNode } from 'react';

export type SimpleGridProps = {
  grid: {
    label: string | ReactNode;
    value?: ReactNode;
  }[];
};

export const SimpleGrid = ({ grid }: SimpleGridProps) => {
  return (
    <>
      {grid.map(
        ({ label, value }, index) =>
          value && (
            <div key={index} className="grid grid-cols-2 gap-2">
              <span data-testid="tooltip-label">{label}</span>
              <span data-testid="tooltip-value" className="text-right">
                {value}
              </span>
            </div>
          )
      )}
    </>
  );
};
