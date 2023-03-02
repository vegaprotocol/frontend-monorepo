import { memo } from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { theme } from '@vegaprotocol/tailwindcss-config';
import { NumericCell } from './numeric-cell';

export interface VolCellProps {
  value: number | bigint | null | undefined;
  valueFormatted: string;
  relativeValue?: number;
  type: 'ask' | 'bid';
  testId?: string;
}
export interface IVolCellProps extends ICellRendererParams {
  value: number | bigint | null | undefined;
  valueFormatted: Omit<VolCellProps, 'value'>;
}

export const BID_COLOR = theme.colors.vega.green.DEFAULT;
export const ASK_COLOR = theme.colors.vega.pink.DEFAULT;

export const VolCell = memo(
  ({ value, valueFormatted, relativeValue, type, testId }: VolCellProps) => {
    if ((!value && value !== 0) || isNaN(Number(value))) {
      return <div data-testid={testId || 'vol'}>-</div>;
    }
    return (
      <div className="relative" data-testid={testId || 'vol'}>
        <div
          data-testid="vol-bar"
          className={classNames(
            'h-full absolute top-0 opacity-40 dark:opacity-100',
            {
              'left-0': type === 'bid',
              'right-0': type === 'ask',
            }
          )}
          style={{
            width: relativeValue ? `${relativeValue}%` : '0%',
            backgroundColor: type === 'bid' ? BID_COLOR : ASK_COLOR,
            opacity: 0.6,
          }}
        />
        <NumericCell value={value} valueFormatted={valueFormatted} />
      </div>
    );
  }
);

VolCell.displayName = 'VolCell';
