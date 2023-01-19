import { memo, forwardRef } from 'react';
import { getDecimalSeparator, isNumeric } from '../format';
export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  testId?: string;
  onClick?: (price?: string | number) => void;
}

export const PriceCell = memo(
  forwardRef<HTMLSpanElement, IPriceCellProps>(
    ({ value, valueFormatted, testId, onClick }: IPriceCellProps, ref) => {
      if (!isNumeric(value)) {
        return (
          <span data-testid="price" ref={ref}>
            -
          </span>
        );
      }
      const decimalSeparator = getDecimalSeparator();
      const valueSplit: string[] = decimalSeparator
        ? valueFormatted.split(decimalSeparator).map((v) => `${v}`)
        : [`${value}`];
      return onClick ? (
        <button onClick={() => onClick(value)}>
          <span
            ref={ref}
            className="font-mono relative text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis text-right rtl-dir"
            data-testid={testId || 'price'}
            title={valueFormatted}
          >
            {valueSplit[0]}
            {valueSplit[1] ? decimalSeparator : null}
            {valueSplit[1] ? (
              <span className="opacity-60">{valueSplit[1]}</span>
            ) : null}
          </span>
        </button>
      ) : (
        <span
          ref={ref}
          className="font-mono relative text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis text-right rtl-dir"
          data-testid={testId || 'price'}
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
  )
);

PriceCell.displayName = 'PriceCell';
