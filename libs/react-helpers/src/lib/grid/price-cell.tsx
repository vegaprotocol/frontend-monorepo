import React from 'react';
export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
}

export const PriceCell = React.memo(
  ({ value, valueFormatted }: IPriceCellProps) => {
    if (
      (!value && value !== 0) ||
      (typeof value === 'number' && isNaN(Number(value)))
    ) {
      return <span data-testid="price">-</span>;
    }
    return (
      <span className="font-mono relative text-ui-small" data-testid="price">
        {valueFormatted}
      </span>
    );
  }
);

PriceCell.displayName = 'PriceCell';
