import { type ReactNode } from 'react';
import classNames from 'classnames';

import { Side } from '@vegaprotocol/types';
import { useForm } from '../use-form';

export const SubmitButton = ({
  text,
  subLabel,
}: {
  text: string;
  subLabel: ReactNode;
}) => {
  const form = useForm();
  const side = form.watch('side');
  return (
    <button
      data-testid="place-order"
      type="submit"
      className={classNames(
        'w-full flex flex-col justify-center items-center rounded text-vega-clight-800 p-2 transition-colors',
        {
          'bg-vega-red-500 enabled:hover:bg-vega-red-550 dark:bg-vega-red-600 dark:enabled:hover:bg-vega-red-650':
            side === Side.SIDE_SELL,
          'bg-vega-green-600 enabled:hover:bg-vega-green-650 dark:bg-vega-green-650 dark:enabled:hover:bg-vega-green-600':
            side === Side.SIDE_BUY,
        }
      )}
    >
      <span>{text}</span>
      <span
        className="text-xs font-mono leading-4 text-vega-clight-800/60 break-all"
        key="trading-button-sub-label"
      >
        {subLabel}
      </span>
    </button>
  );
};
