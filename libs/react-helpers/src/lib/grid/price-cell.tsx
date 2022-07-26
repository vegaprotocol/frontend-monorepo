import React from 'react';
import { getDecimalSeparator } from '../format';
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
    const decimalSeparator = getDecimalSeparator();
    const valueSplit = decimalSeparator
      ? valueFormatted.split(decimalSeparator)
      : [value];
    return (
      <div
        className="font-mono relative text-ui-small text-black dark:text-white"
        data-testid={testId || 'price'}
      >
        <span>{valueSplit[0].toString()}</span>
        <span>{valueSplit[1] ? decimalSeparator : null}</span>
        <span>
          {valueSplit[1] ? (
            <span className="text-black-60 dark:text-white-60">
              {valueSplit[1].toString()}
            </span>
          ) : null}
        </span>
      </div>
    );
  }
);

PriceCell.displayName = 'PriceCell';
