import React from 'react';
export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  testId?: string;
}

export const PriceCell = React.memo(
  ({ value, valueFormatted, testId }: IPriceCellProps) => {
    if (
      (!value && value !== 0) ||
      (typeof value === 'number' && isNaN(Number(value)))
    ) {
      return <span data-testid="price">-</span>;
    }
    return (
      <span className="font-mono relative" data-testid={testId || 'price'}>
        {valueFormatted}
      </span>
    );
  }
);

PriceCell.displayName = 'PriceCell';
