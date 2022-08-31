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
    const valueSplit: string[] = decimalSeparator
      ? valueFormatted.split(decimalSeparator).map((v) => `${v}`)
      : [`${value}`];
    return (
      <span
        className="font-mono relative text-black dark:text-white"
        data-testid={testId || 'price'}
      >
        {valueSplit[0]}
        {valueSplit[1] ? decimalSeparator : null}
        {valueSplit[1] ? <span>{valueSplit[1]}</span> : null}
      </span>
    );
  }
);

PriceCell.displayName = 'PriceCell';
