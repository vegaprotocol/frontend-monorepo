import * as Schema from '@vegaprotocol/types';
import type { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '../format';

export const Size = ({
  value,
  side,
  positionDecimalPlaces = 0,
}: {
  value: string;
  side: Schema.Side;
  positionDecimalPlaces?: number;
}) => {
  return (
    <span
      data-testid="size"
      className={classNames('text-right', {
        'text-vega-green dark:text-vega-green': side === Schema.Side.SIDE_BUY,
        'text-vega-pink dark:text-vega-pink': side === Schema.Side.SIDE_SELL,
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
