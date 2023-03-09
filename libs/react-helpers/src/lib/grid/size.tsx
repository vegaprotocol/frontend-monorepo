import * as Schema from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

export const Size = ({
  value,
  side,
  positionDecimalPlaces = 0,
  forceTheme,
}: {
  value: string;
  side?: Schema.Side;
  positionDecimalPlaces?: number;
  forceTheme?: 'dark' | 'light';
}) => {
  return (
    <span
      data-testid="size"
      className={classNames('text-right', {
        // BUY
        'text-vega-green-550 dark:text-vega-green':
          side === Schema.Side.SIDE_BUY && !forceTheme,
        'text-vega-green-550':
          side === Schema.Side.SIDE_BUY && forceTheme === 'light',
        'text-vega-green':
          side === Schema.Side.SIDE_BUY && forceTheme === 'dark',
        // SELL
        'text-vega-pink-550 dark:text-vega-pink':
          side === Schema.Side.SIDE_SELL && !forceTheme,
        'text-vega-pink-550':
          side === Schema.Side.SIDE_SELL && forceTheme === 'light',
        'text-vega-pink':
          side === Schema.Side.SIDE_SELL && forceTheme === 'dark',
      })}
    >
      {side === Schema.Side.SIDE_BUY
        ? '+'
        : side === Schema.Side.SIDE_SELL
        ? '-'
        : ''}
      {addDecimalsFormatNumber(value, positionDecimalPlaces)}
    </span>
  );
};

export interface ISizeCellProps extends ICellRendererParams {
  value: number | string;
}

export const SizeCell = ({ value, data }: ISizeCellProps) => {
  if ((!value && value !== 0) || isNaN(Number(value))) {
    return <span data-testid="size">-</span>;
  }
  return (
    <Size
      value={value.toString()}
      side={data.side}
      positionDecimalPlaces={data.positionDecimalPlaces}
    />
  );
};

SizeCell.displayName = 'SizeCell';
