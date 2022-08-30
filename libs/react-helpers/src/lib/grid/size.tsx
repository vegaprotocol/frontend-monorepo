import { Side } from '@vegaprotocol/types';
import classNames from 'classnames';
import { addDecimalsFormatNumber } from '../format';

export const Size = ({
  value,
  side,
  positionDecimalPlaces = 0,
}: {
  value: string;
  side: Side;
  positionDecimalPlaces?: number;
}) => {
  return (
    <span
      className={classNames('text-right', {
        'text-dark-green dark:text-vega-green': side === Side.SIDE_BUY,
        'text-red dark:text-vega-red': side === Side.SIDE_SELL,
      })}
    >
      {side === Side.SIDE_BUY ? '+' : side === Side.SIDE_SELL ? '-' : ''}
      {addDecimalsFormatNumber(value, positionDecimalPlaces)}
    </span>
  );
};
