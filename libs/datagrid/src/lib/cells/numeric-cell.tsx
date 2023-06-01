import { forwardRef } from 'react';
import classNames from 'classnames';
import { getDecimalSeparator, isNumeric } from '@vegaprotocol/utils';

interface NumericCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  testId?: string;
}

/**
 * Renders a numeric value in a consistent way for data grid
 * use, right aligned, monospace and decimals deemphasised
 */
export const NumericCell = forwardRef<HTMLSpanElement, NumericCellProps>(
  ({ value, valueFormatted, testId, className }, ref) => {
    if (!isNumeric(value)) {
      return (
        <span ref={ref} data-testid={testId}>
          -
        </span>
      );
    }

    const decimalSeparator = getDecimalSeparator();
    const valueSplit: string[] = decimalSeparator
      ? valueFormatted.split(decimalSeparator).map((v) => `${v}`)
      : [`${value}`];

    return (
      <span
        ref={ref}
        className={classNames(
          'font-mono relative text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis text-right rtl-dir',
          className
        )}
        data-testid={testId}
        title={valueFormatted}
      >
        {valueSplit[0]}
        {valueSplit[1] ? decimalSeparator : null}
        {valueSplit[1] ? (
          <span className="opacity-60">{valueSplit[1]}</span>
        ) : null}
      </span>
    );
  }
);
