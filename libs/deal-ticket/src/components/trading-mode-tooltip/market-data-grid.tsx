import type { ReactNode } from 'react';

export type MarketDataGridProps = {
  grid: {
    label: string | ReactNode;
    value?: ReactNode;
  }[];
};

export const MarketDataGrid = ({ grid }: MarketDataGridProps) => {
  return (
    <>
      {grid.map(
        ({ label, value }, index) =>
          value && (
            <div key={index} className="grid grid-cols-2">
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
