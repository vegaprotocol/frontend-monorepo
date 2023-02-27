import { memo, forwardRef } from 'react';
import { isNumeric } from '../format';
import { NumericCell } from './numeric-cell';
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
      return onClick ? (
        <button
          onClick={() => onClick(value)}
          className="hover:dark:bg-neutral-800 hover:bg-neutral-200 text-right"
        >
          <NumericCell
            value={value}
            valueFormatted={valueFormatted}
            testId={testId || 'price'}
          />
        </button>
      ) : (
        <NumericCell
          value={value}
          valueFormatted={valueFormatted}
          testId={testId || 'price'}
        />
      );
    }
  )
);

PriceCell.displayName = 'PriceCell';
