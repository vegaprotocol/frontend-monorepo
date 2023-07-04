import { memo, forwardRef } from 'react';
import { isNumeric } from '@vegaprotocol/utils';
import { NumericCell } from './numeric-cell';
export interface IPriceCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  testId?: string;
  onClick?: (price?: string | number) => void;
  className?: string;
}

export const PriceCell = memo(
  forwardRef<HTMLSpanElement, IPriceCellProps>(
    (
      { value, valueFormatted, testId, onClick, className }: IPriceCellProps,
      ref
    ) => {
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
          className="hover:dark:bg-vega-cdark-800 hover:bg-vega-clight-800 text-right"
        >
          <NumericCell
            value={value}
            valueFormatted={valueFormatted}
            testId={testId || 'price'}
            className={className}
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
